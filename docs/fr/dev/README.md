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
# Guide DÃ©veloppeur

Bienvenue dans le guide de dÃ©veloppement du Dev Dashboard. Ce document couvre la configuration technique, le flux de travail et les standards de qualitÃ© du projet.

## ðŸ› ï¸ Configuration de l'environnement

### PrÃ©requis
- **Node.js :** v20+ (LTS recommandÃ©e)
- **NPM :** v10+
- **Quasar CLI :** L'installation globale est optionnelle mais recommandÃ©e.
  ```bash
  npm install -g @quasar/cli
  ```

### Installation
1. Clonez le dÃ©pÃ´t.
2. Installez les dÃ©pendances :
   ```bash
   npm install
   ```

## ðŸ”„ Flux de Travail

Le projet suit une mÃ©thodologie de **DÃ©veloppement PilotÃ© par les SpÃ©cifications** gÃ©rÃ©e par **Conductor**.

### Protocoles Conductor
- **`/conductor:setup`** : Initialise l'environnement Conductor (Produit, Stack Tech, Workflow).
- **`/conductor:implement`** : Traite automatiquement la prochaine tÃ¢che en attente dans le `Tracks Registry`.
- **`/conductor:review`** : GÃ©nÃ¨re un rÃ©sumÃ© des modifications pour revue.

### Standards de Code
- **Logique Agnostique :** N'importez jamais de modules Node.js (comme `fs`, `path`, `child_process`) directement dans les composants frontend. Utilisez la couche de service et la dÃ©tection de capacitÃ©s.
- **Typage Strict :** Couverture TypeScript Ã  100%. Ã‰vitez `any` sauf si c'est absolument nÃ©cessaire pour des mocks de bas niveau.
- **i18n Obligatoire :** Ne codez jamais de texte en dur dans l'UI. Toutes les chaÃ®nes doivent rÃ©sider dans `src/i18n/`.

## ðŸ§ª Tests & VÃ©rification

### Tests Unitaires (Vitest)
Les tests unitaires sont utilisÃ©s pour les stores, les services et la logique utilitaire.
- **Lancer tous les tests :** `npm run test:unit`
- **Lancer un test spÃ©cifique :** `npx vitest run src/path/to/test.spec.ts`

### Tests End-to-End (Cypress)
Cypress est utilisÃ© pour la vÃ©rification des fonctionnalitÃ©s et les audits d'accessibilitÃ© (a11y).
- **Ouvrir l'UI Cypress :** `npx cypress open`
- **Lancer la suite en mode headless :** `npx cypress run`

### Linting
Nous utilisons ESLint avec des rÃ¨gles spÃ©cifiques pour Vue 3 et TypeScript.
- **VÃ©rifier le code :** `npm run lint`

## ðŸ—ï¸ Commandes de Build

L'application peut Ãªtre compilÃ©e pour diffÃ©rentes cibles :

| Mode | Commande | Description |
| :--- | :--- | :--- |
| **Electron** | `quasar build -m electron` | Application de bureau native. |
| **SSR** | `quasar build -m ssr` | Application web avec rendu serveur et API intÃ©grÃ©e. |
| **SPA** | `quasar build` | Application web statique (local-uniquement). |

---

_Consultez la [RÃ©fÃ©rence API](../api/README.md) pour plus de dÃ©tails architecturaux._
