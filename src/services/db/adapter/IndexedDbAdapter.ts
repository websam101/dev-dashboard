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
    value: unknown;
  };
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  description: string;
  ports: number[];
  repoUrl?: string;
  branch?: string;
  gitStatus?: string;
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
      this.db = await openDB<DevDashboardDB>(this.dbName, 1, {
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

  async searchBookmarks(query: string): Promise<Bookmark[]> {
    const all = await this.getBookmarks();
    const q = query.toLowerCase();
    return all.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q)),
    );
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

  // GitRepo methods
  async addGitRepo(repo: GitRepo): Promise<void> {
    await this.connect();
    await this.db!.put("gitRepos", repo);
  }

  async getGitRepos(): Promise<GitRepo[]> {
    await this.connect();
    return await this.db!.getAll("gitRepos");
  }

  async updateGitRepo(repo: GitRepo): Promise<void> {
    await this.connect();
    await this.db!.put("gitRepos", repo);
  }

  async deleteGitRepo(url: string): Promise<void> {
    await this.connect();
    await this.db!.delete("gitRepos", url);
  }

  // Settings methods
  async getSetting<T = unknown>(key: string): Promise<T | undefined> {
    await this.connect();
    return await this.db!.get("settings", key) as T | undefined;
  }

  async setSetting(key: string, value: unknown): Promise<void> {
    await this.connect();
    await this.db!.put("settings", { key, value });
  }
}
