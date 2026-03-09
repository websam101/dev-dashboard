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
# Services & Architecture

Ce rÃ©pertoire contient la logique mÃ©tier pour la gestion des donnÃ©es et les interactions avec le systÃ¨me d'exploitation. L'architecture est conÃ§ue pour Ãªtre **agnostique**, garantissant que l'application fonctionne parfaitement dans les modes Electron, SSR et SPA.

## ðŸ—ï¸ Architecture des DonnÃ©es Agnostique

Nous utilisons une approche "Local-First" oÃ¹ les donnÃ©es sont principalement stockÃ©es dans l'**IndexedDB** du navigateur et synchronisÃ©es de maniÃ¨re optionnelle avec un **backend JSON** local.

```mermaid
graph TD
    UI[Stores Pinia] --> DS[AgnosticDataService]
    DS --> IDB[(IndexedDB)]
    DS --> API[API Axios]
    API -- "si hasBackend" --> BE[Middleware SSR/Electron]
    BE --> LDB[(LowDB JSON)]
```

### Composants ClÃ©s :
1. **`AgnosticDataService.ts`** : L'orchestrateur central. Il vÃ©rifie la disponibilitÃ© du backend et gÃ¨re la logique d'Ã©criture dans le stockage local en prioritÃ©, puis la synchronisation avec le backend si possible.
2. **`StorageAdapter` (Interface)** : DÃ©finit le contrat pour les opÃ©rations de base de donnÃ©es.
3. **`IndexedDbAdapter.ts`** : L'implÃ©mentation par dÃ©faut pour le stockage cÃ´tÃ© navigateur.

### ðŸ’¾ Logique de Sauvegarde et Restauration
L'`AgnosticDataService` fournit des mÃ©thodes pour la gestion complÃ¨te de l'Ã©tat de l'application :
- **`exportAllData()`** : Regroupe toutes les donnÃ©es d'IndexedDB (Projets, Favoris, Collections, ParamÃ¨tres) dans un bundle JSON unique et versionnÃ©.
- **`importAllData(json)`** : Valide et remplace l'Ã©tat local actuel par la sauvegarde fournie, en poussant optionnellement le nouvel Ã©tat vers le backend s'il est accessible.

## ðŸ–¥ï¸ Services Serveur (Node.js uniquement)

Ces services ne sont exÃ©cutÃ©s que dans les environnements **Electron** ou **SSR** via la couche middleware.

- **`SystemMonitor.ts`** : Suit l'utilisation du CPU, de la RAM, du disque et du rÃ©seau via `systeminformation`.
- **`ProjectManager.ts`** : GÃ¨re le scan rÃ©cursif de fichiers, l'extraction de l'Ã©tat Git (`simple-git`) et la dÃ©tection des stacks techniques.
- **`ActionExecutor.ts`** : ExÃ©cute des commandes OS comme l'ouverture de VS Code ou d'un terminal.

## ðŸ“¡ Points de terminaison API (SSR/Electron)

Toutes les interactions backend passent par les points de terminaison suivants :

| Point de terminaison | MÃ©thode | Description |
| :--- | :--- | :--- |
| `/api/system/stats` | GET | MÃ©triques des ressources systÃ¨me en temps rÃ©el. |
| `/api/utils/check-port` | POST | VÃ©rifie si un port spÃ©cifique est utilisÃ©. |
| `/api/actions/open-task-manager` | POST | Ouvre le gestionnaire de tÃ¢ches natif du systÃ¨me. |
| `/api/projects/scan` | POST | Scanne rÃ©cursivement un rÃ©pertoire pour trouver des projets. |
| `/api/projects/update` | POST | Synchronise les mÃ©tadonnÃ©es d'un projet vers le backend JSON. |
| `/api/settings` | GET/POST | RÃ©cupÃ¨re ou pousse les paramÃ¨tres de l'application. |

---

_Consultez le [Guide des Stores](./README.md) pour voir comment les composants consomment ces services._
