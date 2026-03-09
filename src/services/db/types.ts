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
export interface BookmarkCollection {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  favorite?: boolean;
  projectIds?: string[];
  collectionId?: string | undefined;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  description: string;
  ports: number[];
  techs: string[];
  git?: any;
  managedPorts?: number[];
  favorite?: boolean;
}

export interface PortRecord {
  port: number;
  projectId: string;
  reserved: boolean;
  inUse: boolean;
  pid?: number | undefined;
  processName?: string | undefined;
}

export interface GitRepo {
  url: string;
  localPath: string;
  branch: string;
  status: "clean" | "dirty" | "ahead" | "behind";
  lastSync: string;
}

export interface StorageAdapter {
  connect(): Promise<void>;
  disconnect(): void;

  // Collection methods
  addCollection(collection: BookmarkCollection): Promise<void>;
  getCollections(): Promise<BookmarkCollection[]>;
  updateCollection(collection: BookmarkCollection): Promise<void>;
  deleteCollection(id: string): Promise<void>;

  // Bookmark methods
  addBookmark(bookmark: Bookmark): Promise<void>;
  getBookmarks(): Promise<Bookmark[]>;
  updateBookmark(bookmark: Bookmark): Promise<void>;
  deleteBookmark(id: string): Promise<void>;

  // Project methods
  addProject(project: Project): Promise<void>;
  bulkAddProjects(projects: Project[]): Promise<void>;
  getProjects(): Promise<Project[]>;
  updateProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;

  // Port methods
  addPort(port: PortRecord): Promise<void>;
  getPorts(): Promise<PortRecord[]>;
  updatePort(port: PortRecord): Promise<void>;
  deletePort(port: number): Promise<void>;

  // Settings methods
  getSetting<T = unknown>(key: string): Promise<T | undefined>;
  setSetting(key: string, value: unknown): Promise<void>;
}
