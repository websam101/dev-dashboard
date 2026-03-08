import { defineStore } from 'pinia';
import { IndexedDbAdapter } from '../services/db/adapter/IndexedDbAdapter';
import type { BookmarkCollection, Bookmark } from '../services/db/types';
import { api } from '../boot/api';

const db = new IndexedDbAdapter();
const clean = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useBookmarksStore = defineStore('bookmarks', {
  state: () => ({
    bookmarks: [] as Bookmark[],
    collections: [] as BookmarkCollection[],
    loading: false
  }),
  actions: {
    async loadCollections() {
      if (!process.env.CLIENT) return;
      try {
        this.collections = await db.getCollections();
      } catch (e) {
        console.error('Failed to load collections', e);
      }
    },
    async addCollection(name: string) {
      if (!process.env.CLIENT) return;
      const collection: BookmarkCollection = { id: Date.now().toString(), name };
      await db.addCollection(collection);
      await this.loadCollections();
    },
    async updateCollection(collection: BookmarkCollection) {
      if (!process.env.CLIENT) return;
      await db.updateCollection(collection);
      await this.loadCollections();
    },
    async deleteCollection(id: string) {
      if (!process.env.CLIENT) return;
      await db.deleteCollection(id);
      for (const b of this.bookmarks) {
        if (b.collectionId === id) {
          b.collectionId = undefined;
          await this.updateBookmark(b);
        }
      }
      await this.loadCollections();
    },
    async loadBookmarks() {
      if (!process.env.CLIENT) return;
      this.loading = true;
      try {
        await this.loadCollections();
        
        // Initial sync of collections from backend if local is empty
        if (this.collections.length === 0) {
          try {
            const colRes = await api.get('/api/collections');
            if (Array.isArray(colRes.data) && colRes.data.length > 0) {
              for (const c of colRes.data) await db.addCollection(clean(c));
              await this.loadCollections();
            }
          } catch (e) {}
        }

        const local = await db.getBookmarks();
        this.bookmarks = local.map(b => {
          const raw = b as any;
          const pIds: string[] = Array.isArray(raw.projectIds) ? raw.projectIds : (raw.projectId ? [raw.projectId] : []);
          const cAt = b.createdAt || (/^\d+$/.test(b.id) ? new Date(parseInt(b.id)).toISOString() : new Date().toISOString());
          return {
            id: b.id, title: b.title, url: b.url,
            tags: (Array.isArray(raw.tags) && raw.tags.length > 0) ? raw.tags : (raw.category ? [raw.category] : ['General']),
            description: b.description, favorite: !!b.favorite,
            projectIds: pIds.length > 0 ? pIds : ['global'],
            collectionId: b.collectionId || undefined, createdAt: cAt
          };
        });

        // Sync from Backend
        try {
          const response = await api.get('/api/bookmarks');
          if (Array.isArray(response.data) && response.data.length > 0) {
            for (const remote of response.data) {
              const localIdx = this.bookmarks.findIndex(b => b.id === remote.id);
              let rpIds: string[] = Array.isArray(remote.projectIds) ? remote.projectIds : (remote.projectId ? [remote.projectId] : ['global']);
              if (rpIds.length === 0) rpIds = ['global'];
              const cleanedRemote = clean({
                ...remote,
                tags: Array.isArray(remote.tags) ? remote.tags : (remote.category ? [remote.category] : ['General']),
                favorite: !!remote.favorite, projectIds: rpIds, collectionId: remote.collectionId || undefined,
                createdAt: remote.createdAt || new Date().toISOString()
              });
              if (localIdx > -1) this.bookmarks[localIdx] = cleanedRemote;
              else this.bookmarks.push(cleanedRemote);
              await db.addBookmark({ ...cleanedRemote, description: cleanedRemote.description || '', createdAt: cleanedRemote.createdAt! });
            }
          }
        } catch (e) {}
      } catch (e) {
        console.error('Failed to load bookmarks', e);
      } finally { this.loading = false; }
    },
    /**
     * Replaces local state with a full snapshot. Used for Import and Pull.
     */
    async importSnapshot(data: { bookmarks: Bookmark[], collections: BookmarkCollection[] }) {
      if (!process.env.CLIENT) return;
      this.loading = true;
      try {
        // 1. Clear Collections
        const oldCols = await db.getCollections();
        for (const c of oldCols) await db.deleteCollection(c.id);
        // 2. Add New Collections
        for (const c of data.collections || []) await db.addCollection(clean(c));
        await this.loadCollections();

        // 3. Clear Bookmarks
        const oldBs = await db.getBookmarks();
        for (const b of oldBs) await db.deleteBookmark(b.id);
        // 4. Add New Bookmarks
        for (const b of data.bookmarks || []) {
          const cleaned = clean({
            ...b,
            description: b.description || '',
            tags: b.tags || [],
            createdAt: b.createdAt || new Date().toISOString()
          });
          await db.addBookmark(cleaned as any);
        }
        await this.loadBookmarks();
      } finally {
        this.loading = false;
      }
    },
    async forcePushToBackend() {
      if (!process.env.CLIENT) return;
      this.loading = true;
      try {
        // OVERWRITE Backend with Local State (Atomic Batch)
        await api.post('/api/collections/sync', clean(this.collections));
        await api.post('/api/bookmarks/sync', clean(this.bookmarks));
      } finally {
        this.loading = false;
      }
    },
    async forcePullFromBackend() {
      if (!process.env.CLIENT) return;
      try {
        const [colRes, bRes] = await Promise.all([
          api.get('/api/collections'),
          api.get('/api/bookmarks')
        ]);
        if (Array.isArray(colRes.data) && Array.isArray(bRes.data)) {
          await this.importSnapshot({
            collections: colRes.data,
            bookmarks: bRes.data
          });
        }
      } catch (e) {
        console.error('Pull failed', e);
      }
    },
    async toggleFavorite(id: string) {
      const bookmark = this.bookmarks.find(b => b.id === id);
      if (bookmark) {
        bookmark.favorite = !bookmark.favorite;
        await this.updateBookmark(bookmark);
      }
    },
    async updateBookmark(bookmark: Bookmark) {
      if (!process.env.CLIENT) return;
      try {
        const cleaned = clean(bookmark);
        await db.addBookmark({ ...cleaned, description: cleaned.description || '', createdAt: bookmark.createdAt || new Date().toISOString() });
        const idx = this.bookmarks.findIndex(b => b.id === bookmark.id);
        if (idx > -1) this.bookmarks[idx] = cleaned;
        void api.post('/api/bookmarks', cleaned).catch(() => {});
      } catch (e) { console.error('Failed to update bookmark', e); }
    },
    async addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>) {
      if (!process.env.CLIENT) return;
      try {
        const now = new Date().toISOString();
        const newBookmark: Bookmark = { favorite: false, projectIds: ['global'], ...bookmark, id: Date.now().toString(), createdAt: now };
        const cleaned = clean(newBookmark);
        await db.addBookmark({ ...cleaned, description: cleaned.description || '', createdAt: now });
        this.bookmarks.push(cleaned);
        void api.post('/api/bookmarks', cleaned).catch(() => {});
      } catch (e) { console.error('Failed to add bookmark', e); }
    },
    async deleteBookmark(id: string) {
      if (!process.env.CLIENT) return;
      try {
        await db.deleteBookmark(id);
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
        void api.post('/api/bookmarks/remove', { id }).catch(() => {});
      } catch (e) { console.error('Failed to delete bookmark', e); }
    }
  },
  getters: {
    allTags: (state) => {
      const tags = new Set<string>();
      state.bookmarks.forEach(b => { if (Array.isArray(b.tags)) b.tags.forEach(t => tags.add(t)); });
      return Array.from(tags).sort();
    },
    byTag: (state) => (tag: string) => state.bookmarks.filter(b => b.tags?.includes(tag)),
    favorites: (state) => state.bookmarks.filter(b => b.favorite),
    byCollection: (state) => (collectionId: string) => {
      if (collectionId === 'all') return state.bookmarks;
      if (collectionId === 'unassigned') return state.bookmarks.filter(b => !b.collectionId);
      return state.bookmarks.filter(b => b.collectionId === collectionId);
    }
  }
});
