import { IndexedDbAdapter } from './adapter/IndexedDbAdapter';
import type { StorageAdapter, Project, Bookmark, BookmarkCollection } from './types';
import { api, hasBackend } from '../../boot/api';

export class AgnosticDataService {
  private local: StorageAdapter;
  private hasBackend: boolean;

  constructor() {
    this.local = new IndexedDbAdapter();
    this.hasBackend = hasBackend;
  }

  // --- Projects ---
  async getProjects(): Promise<Project[]> {
    return await this.local.getProjects();
  }

  async saveProject(project: Project): Promise<void> {
    await this.local.addProject(this.clean(project));
    if (this.hasBackend) {
      void api.post('/api/projects/update', this.clean(project)).catch(() => {});
    }
  }

  async deleteProject(id: string): Promise<void> {
    await this.local.deleteProject(id);
    if (this.hasBackend) {
      void api.post('/api/projects/remove', { id }).catch(() => {});
    }
  }

  // --- Settings ---
  async getSetting<T>(key: string): Promise<T | undefined> {
    return await this.local.getSetting<T>(key);
  }

  async setSetting(key: string, value: unknown): Promise<void> {
    const cleaned = this.clean(value);
    await this.local.setSetting(key, cleaned);
    if (this.hasBackend && key === 'app_settings') {
      void api.post('/api/settings', cleaned).catch(() => {});
    }
  }

  // --- Bookmarks ---
  async getBookmarks(): Promise<Bookmark[]> {
    return await this.local.getBookmarks();
  }

  async saveBookmark(bookmark: Bookmark): Promise<void> {
    await this.local.addBookmark(this.clean(bookmark));
    if (this.hasBackend) {
      void api.post('/api/bookmarks', this.clean(bookmark)).catch(() => {});
    }
  }

  async deleteBookmark(id: string): Promise<void> {
    await this.local.deleteBookmark(id);
    if (this.hasBackend) {
      void api.post('/api/bookmarks/remove', { id }).catch(() => {});
    }
  }

  // --- Utils ---
  private clean<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}

export const agnosticDataService = new AgnosticDataService();
