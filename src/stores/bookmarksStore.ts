import { defineStore } from 'pinia';
import { api } from '../boot/axios';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  tags?: string[];
}

export const useBookmarksStore = defineStore('bookmarks', {
  state: () => ({
    bookmarks: [] as Bookmark[],
    loading: false
  }),
  actions: {
    async loadBookmarks() {
      this.loading = true;
      try {
        const response = await api.get('/api/bookmarks');
        this.bookmarks = Array.isArray(response.data) ? response.data : [];
      } catch (e) {
        console.error('Failed to load bookmarks', e);
        this.bookmarks = [];
      } finally {
        this.loading = false;
      }
    },
    async addBookmark(bookmark: Omit<Bookmark, 'id'>) {
      try {
        const response = await api.post('/api/bookmarks', bookmark);
        this.bookmarks = Array.isArray(response.data) ? response.data : [];
      } catch (e) {
        console.error('Failed to add bookmark', e);
      }
    }
  },
  getters: {
    categories: (state) => {
      if (!Array.isArray(state.bookmarks)) return [];
      const cats = new Set(state.bookmarks.map(b => b.category));
      return Array.from(cats);
    },
    byCategory: (state) => (category: string) => {
      if (!Array.isArray(state.bookmarks)) return [];
      return state.bookmarks.filter(b => b.category === category);
    }
  }
});
