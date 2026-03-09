<!--
  Copyright (C) 2025-2026 Sam <websam101@gmail.com>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

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

_Refer to [AgnosticDataService.ts](../AgnosticDataService.ts) for synchronization logic._
