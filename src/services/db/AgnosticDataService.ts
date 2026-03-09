/**
 * Copyright (C) 2025-2026 Sam <websam101@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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

  // --- Full Backup & Restore ---
  async exportAllData(): Promise<string> {
    const projects = await this.local.getProjects();
    const bookmarks = await this.local.getBookmarks();
    const collections = await this.local.getCollections();
    const settings = await this.local.getSetting('app_settings');

    const bundle = {
      version: 1,
      timestamp: new Date().toISOString(),
      data: {
        projects,
        bookmarks,
        collections,
        settings
      }
    };

    return JSON.stringify(bundle, null, 2);
  }

  async importAllData(json: string): Promise<void> {
    const bundle = JSON.parse(json);
    if (!bundle.data) throw new Error('Invalid backup file');

    const { projects, bookmarks, collections, settings } = bundle.data;

    // Clear and restore locally
    if (collections) {
      for (const c of await this.local.getCollections()) await this.local.deleteCollection(c.id);
      for (const c of collections) await this.local.addCollection(c);
    }
    if (bookmarks) {
      for (const b of await this.local.getBookmarks()) await this.local.deleteBookmark(b.id);
      for (const b of bookmarks) await this.local.addBookmark(b);
    }
    if (projects) {
      for (const p of await this.local.getProjects()) await this.local.deleteProject(p.id);
      for (const p of projects) await this.local.addProject(p);
    }
    if (settings) {
      await this.local.setSetting('app_settings', settings);
    }

    // If we have a backend, push the state
    if (this.hasBackend) {
      if (projects) await api.post('/api/projects/sync', projects).catch(() => {});
      if (bookmarks) await api.post('/api/bookmarks/sync', bookmarks).catch(() => {});
      if (collections) await api.post('/api/collections/sync', collections).catch(() => {});
      if (settings) await api.post('/api/settings', settings).catch(() => {});
    }
  }

  // --- Utils ---
  private clean<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}

export const agnosticDataService = new AgnosticDataService();
