import type { DBSchema, IDBPDatabase } from "idb";
import { openDB } from "idb";

interface DevDashboardDB extends DBSchema {
  bookmarks: {
    key: string;
    value: Bookmark;
  };
  projects: {
    key: string;
    value: Project;
  };
  ports: {
    key: number;
    value: PortRecord;
  };
  gitRepos: {
    key: string;
    value: GitRepo;
  };
  settings: {
    key: string;
    value: { key: string; value: unknown };
  };
  collections: {
    key: string;
    value: BookmarkCollection;
  };
}

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

export class IndexedDbAdapter {
  private dbName = "dev-dashboard-db";
  private db: IDBPDatabase<DevDashboardDB> | null = null;

  async connect(): Promise<void> {
    if (!this.db) {
      this.db = await openDB<DevDashboardDB>(this.dbName, 2, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("bookmarks")) {
            db.createObjectStore("bookmarks", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("projects")) {
            db.createObjectStore("projects", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("ports")) {
            db.createObjectStore("ports", { keyPath: "port" });
          }
          if (!db.objectStoreNames.contains("gitRepos")) {
            db.createObjectStore("gitRepos", { keyPath: "url" });
          }
          if (!db.objectStoreNames.contains("settings")) {
            db.createObjectStore("settings", { keyPath: "key" });
          }
          if (!db.objectStoreNames.contains("collections")) {
            db.createObjectStore("collections", { keyPath: "id" });
          }
        },
      });
    }
  }

  disconnect(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // Collection methods
  async addCollection(collection: BookmarkCollection): Promise<void> {
    await this.connect();
    await this.db!.put("collections", collection);
  }

  async getCollections(): Promise<BookmarkCollection[]> {
    await this.connect();
    return await this.db!.getAll("collections");
  }

  async updateCollection(collection: BookmarkCollection): Promise<void> {
    await this.connect();
    await this.db!.put("collections", collection);
  }

  async deleteCollection(id: string): Promise<void> {
    await this.connect();
    await this.db!.delete("collections", id);
  }

  // Bookmark methods
  async addBookmark(bookmark: Bookmark): Promise<void> {
    await this.connect();
    await this.db!.put("bookmarks", bookmark);
  }

  async getBookmarks(): Promise<Bookmark[]> {
    await this.connect();
    return await this.db!.getAll("bookmarks");
  }

  async updateBookmark(bookmark: Bookmark): Promise<void> {
    await this.connect();
    await this.db!.put("bookmarks", bookmark);
  }

  async deleteBookmark(id: string): Promise<void> {
    await this.connect();
    await this.db!.delete("bookmarks", id);
  }

  // Project methods
  async addProject(project: Project): Promise<void> {
    await this.connect();
    await this.db!.put("projects", project);
  }

  async getProjects(): Promise<Project[]> {
    await this.connect();
    return await this.db!.getAll("projects");
  }

  async updateProject(project: Project): Promise<void> {
    await this.connect();
    await this.db!.put("projects", project);
  }

  async deleteProject(id: string): Promise<void> {
    await this.connect();
    await this.db!.delete("projects", id);
  }

  // Port methods
  async addPort(port: PortRecord): Promise<void> {
    await this.connect();
    await this.db!.put("ports", port);
  }

  async getPorts(): Promise<PortRecord[]> {
    await this.connect();
    return await this.db!.getAll("ports");
  }

  async updatePort(port: PortRecord): Promise<void> {
    await this.connect();
    await this.db!.put("ports", port);
  }

  async deletePort(port: number): Promise<void> {
    await this.connect();
    await this.db!.delete("ports", port);
  }

  // Settings methods
  async getSetting<T = unknown>(key: string): Promise<T | undefined> {
    await this.connect();
    const res = await this.db!.get("settings", key);
    return res ? (res.value as T) : undefined;
  }

  async setSetting(key: string, value: unknown): Promise<void> {
    await this.connect();
    // Final guard: Ensure data is clean and serializable
    const cleanedValue = JSON.parse(JSON.stringify(value));
    await this.db!.put("settings", { key, value: cleanedValue });
  }
}
