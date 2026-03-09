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
# SchÃ©ma des DonnÃ©es & Persistance

L'application emploie une stratÃ©gie de double stockage pour garantir la disponibilitÃ© des donnÃ©es selon les diffÃ©rents modes d'exÃ©cution.

## ðŸ’¾ Couches de Stockage

### 1. IndexedDB (CÃ´tÃ© Client)
UtilisÃ© comme source de vÃ©ritÃ© principale "Local-First".
- **Nom de la base :** `dev-dashboard-db`
- **Magasins (Stores) :**
  - `projects` : IndexÃ© par `id` (base64 du chemin).
  - `bookmarks` : IndexÃ© par `id`.
  - `collections` : IndexÃ© par `id`.
  - `settings` : IndexÃ© par `key` (ex: `app_settings`).
  - `ports` : Enregistrements mis en cache du statut des ports.

### 2. LowDB (CÃ´tÃ© Serveur)
UtilisÃ© pour la persistance dans les modes Electron et SSR. Les donnÃ©es sont sauvegardÃ©es dans un fichier JSON dans le rÃ©pertoire utilisateur.
- **Chemin :** `~/.dev-dashboard/db.json`
- **Structure :**
  ```json
  {
    "projects": [],
    "bookmarks": [],
    "collections": [],
    "settings": {}
  }
  ```

## ðŸ“ ModÃ¨les de DonnÃ©es

### Projet
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

### Favori (Bookmark)
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

_Consultez [AgnosticDataService.ts](../../../src/services/db/AgnosticDataService.ts) pour la logique de synchronisation._
