# Schéma des Données & Persistance

L'application emploie une stratégie de double stockage pour garantir la disponibilité des données selon les différents modes d'exécution.

## 💾 Couches de Stockage

### 1. IndexedDB (Côté Client)
Utilisé comme source de vérité principale "Local-First".
- **Nom de la base :** `dev-dashboard-db`
- **Magasins (Stores) :**
  - `projects` : Indexé par `id` (base64 du chemin).
  - `bookmarks` : Indexé par `id`.
  - `collections` : Indexé par `id`.
  - `settings` : Indexé par `key` (ex: `app_settings`).
  - `ports` : Enregistrements mis en cache du statut des ports.

### 2. LowDB (Côté Serveur)
Utilisé pour la persistance dans les modes Electron et SSR. Les données sont sauvegardées dans un fichier JSON dans le répertoire utilisateur.
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

## 📐 Modèles de Données

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
