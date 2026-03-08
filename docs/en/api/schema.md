# Data Schema & Persistence

The application employs a dual-storage strategy to ensure data availability across different execution modes.

## 💾 Storage Layers

### 1. IndexedDB (Client-Side)
Used as the primary "Local-First" source of truth.
- **Database Name:** `dev-dashboard-db`
- **Stores:**
  - `projects`: Keyed by `id` (base64 of path).
  - `bookmarks`: Keyed by `id`.
  - `collections`: Keyed by `id`.
  - `settings`: Keyed by `key` (e.g., `app_settings`).
  - `ports`: Cached port status records.

### 2. LowDB (Server-Side)
Used for persistence in Electron and SSR modes. Data is saved to a JSON file in the user's home directory.
- **Path:** `~/.dev-dashboard/db.json`
- **Structure:**
  ```json
  {
    "projects": [],
    "bookmarks": [],
    "collections": [],
    "settings": {}
  }
  ```

## 📐 Data Models

### Project
```typescript
interface Project {
  id: string;
  name: string;
  path: string;
  description: string;
  techs: string[];
  git?: {
    branch: string;
    isDirty: boolean;
    ahead: number;
    behind: number;
    lastCommit: string;
  };
  ports: number[];
  managedPorts: number[];
  favorite: boolean;
}
```

### Bookmark
```typescript
interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  favorite: boolean;
  collectionId?: string;
}
```

---

_Refer to [AgnosticDataService.ts](../../../src/services/db/AgnosticDataService.ts) for synchronization logic._
