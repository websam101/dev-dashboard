import { defineStore } from 'pinia';
import { IndexedDbAdapter } from '../services/db/adapter/IndexedDbAdapter';
import type { BookmarkCollection } from '../services/db/adapter/IndexedDbAdapter';
import { api } from '../boot/axios';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  tags: string[];
  description?: string;
  favorite?: boolean;
  projectIds?: string[];
  collectionId?: string | undefined;
  createdAt?: string;
}

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
      const collection: BookmarkCollection = {
        id: Date.now().toString(),
        name
      };
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
      
      // Update affected bookmarks to 'unassigned' or remove the reference
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
        
        // 1. Load from IndexedDB
        const local = await db.getBookmarks();
        this.bookmarks = local.map(b => {
          const raw = b as any;
          let pIds: string[] = [];
          if (Array.isArray(raw.projectIds)) {
            pIds = raw.projectIds;
          } else if (raw.projectId) {
            pIds = [raw.projectId];
          }

          // Fallback for missing createdAt
          let cAt = b.createdAt;
          if (!cAt) {
            // If id is a timestamp (numeric string), use it
            if (/^\d+$/.test(b.id)) {
              cAt = new Date(parseInt(b.id)).toISOString();
            } else {
              cAt = new Date().toISOString();
            }
          }

          return {
            id: b.id,
            title: b.title,
            url: b.url,
            tags: (Array.isArray(raw.tags) && raw.tags.length > 0)
              ? raw.tags
              : (raw.category ? [raw.category] : ['General']),
            description: b.description,
            favorite: !!b.favorite,
            projectIds: pIds.length > 0 ? pIds : ['global'],
            collectionId: b.collectionId || undefined,
            createdAt: cAt
          };
        });

        // 2. Sync with Backend API
        try {
          const response = await api.get('/api/bookmarks');
          if (Array.isArray(response.data) && response.data.length > 0) {
            const remoteBookmarks = response.data;
            
            for (const remote of remoteBookmarks) {
              const localIdx = this.bookmarks.findIndex(b => b.id === remote.id);
              
              let rpIds: string[] = [];
              if (Array.isArray(remote.projectIds)) {
                rpIds = remote.projectIds;
              } else if (remote.projectId) {
                rpIds = [remote.projectId];
              }
              if (rpIds.length === 0) rpIds = ['global'];

              const cleanedRemote = clean({
                ...remote,
                tags: Array.isArray(remote.tags) ? remote.tags : (remote.category ? [remote.category] : ['General']),
                favorite: !!remote.favorite,
                projectIds: rpIds,
                collectionId: remote.collectionId || undefined,
                createdAt: remote.createdAt || new Date().toISOString()
              });

              if (localIdx > -1) {
                this.bookmarks[localIdx] = cleanedRemote;
              } else {
                this.bookmarks.push(cleanedRemote);
              }
              
              await db.addBookmark({
                ...cleanedRemote,
                description: cleanedRemote.description || '',
                createdAt: cleanedRemote.createdAt!
              });
            }
          }
        } catch (e) {
          // Sync failure ignored
        }
      } catch (e) {
        console.error('Failed to load bookmarks', e);
      } finally {
        this.loading = false;
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
        await db.addBookmark({
          ...cleaned,
          description: cleaned.description || '',
          createdAt: bookmark.createdAt || new Date().toISOString()
        });
        
        const idx = this.bookmarks.findIndex(b => b.id === bookmark.id);
        if (idx > -1) this.bookmarks[idx] = cleaned;
        
        void api.post('/api/bookmarks', cleaned).catch(() => {});
      } catch (e) {
        console.error('Failed to update bookmark', e);
      }
    },
    async addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>) {
      if (!process.env.CLIENT) return;

      try {
        const now = new Date().toISOString();
        const newBookmark: Bookmark = {
          ...bookmark,
          id: Date.now().toString(),
          createdAt: now
        };
        
        const cleaned = clean(newBookmark);
        
        await db.addBookmark({
          ...cleaned,
          description: cleaned.description || '',
          createdAt: now
        });
        
        this.bookmarks.push(cleaned);
        void api.post('/api/bookmarks', cleaned).catch(() => {});
      } catch (e) {
        console.error('Failed to add bookmark', e);
      }
    },
    async deleteBookmark(id: string) {
      if (!process.env.CLIENT) return;

      try {
        await db.deleteBookmark(id);
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
        void api.post('/api/bookmarks/remove', { id }).catch(() => {});
      } catch (e) {
        console.error('Failed to delete bookmark', e);
      }
    }
  },
  getters: {
    allTags: (state) => {
      const tags = new Set<string>();
      state.bookmarks.forEach(b => {
        if (Array.isArray(b.tags)) {
          b.tags.forEach(t => tags.add(t));
        }
      });
      return Array.from(tags).sort();
    },
    byTag: (state) => (tag: string) => {
      return state.bookmarks.filter(b => b.tags?.includes(tag));
    },
    favorites: (state) => {
      return state.bookmarks.filter(b => b.favorite);
    },
    byCollection: (state) => (collectionId: string) => {
      if (collectionId === 'all') return state.bookmarks;
      if (collectionId === 'unassigned') return state.bookmarks.filter(b => !b.collectionId);
      return state.bookmarks.filter(b => b.collectionId === collectionId);
    }
  }
});
