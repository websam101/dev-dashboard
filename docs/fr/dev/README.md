# Guide Développeur

Bienvenue dans le guide de développement du Dev Dashboard. Ce document couvre la configuration technique, le flux de travail et les standards de qualité du projet.

## 🛠️ Configuration de l'environnement

### Prérequis
- **Node.js :** v20+ (LTS recommandée)
- **NPM :** v10+
- **Quasar CLI :** L'installation globale est optionnelle mais recommandée.
  ```bash
  npm install -g @quasar/cli
  ```

### Installation
1. Clonez le dépôt.
2. Installez les dépendances :
   ```bash
   npm install
   ```

## 🔄 Flux de Travail

Le projet suit une méthodologie de **Développement Piloté par les Spécifications** gérée par **Conductor**.

### Protocoles Conductor
- **`/conductor:setup`** : Initialise l'environnement Conductor (Produit, Stack Tech, Workflow).
- **`/conductor:implement`** : Traite automatiquement la prochaine tâche en attente dans le `Tracks Registry`.
- **`/conductor:review`** : Génère un résumé des modifications pour revue.

### Standards de Code
- **Logique Agnostique :** N'importez jamais de modules Node.js (comme `fs`, `path`, `child_process`) directement dans les composants frontend. Utilisez la couche de service et la détection de capacités.
- **Typage Strict :** Couverture TypeScript à 100%. Évitez `any` sauf si c'est absolument nécessaire pour des mocks de bas niveau.
- **i18n Obligatoire :** Ne codez jamais de texte en dur dans l'UI. Toutes les chaînes doivent résider dans `src/i18n/`.

## 🧪 Tests & Vérification

### Tests Unitaires (Vitest)
Les tests unitaires sont utilisés pour les stores, les services et la logique utilitaire.
- **Lancer tous les tests :** `npm run test:unit`
- **Lancer un test spécifique :** `npx vitest run src/path/to/test.spec.ts`

### Tests End-to-End (Cypress)
Cypress est utilisé pour la vérification des fonctionnalités et les audits d'accessibilité (a11y).
- **Ouvrir l'UI Cypress :** `npx cypress open`
- **Lancer la suite en mode headless :** `npx cypress run`

### Linting
Nous utilisons ESLint avec des règles spécifiques pour Vue 3 et TypeScript.
- **Vérifier le code :** `npm run lint`

## 🏗️ Commandes de Build

L'application peut être compilée pour différentes cibles :

| Mode | Commande | Description |
| :--- | :--- | :--- |
| **Electron** | `quasar build -m electron` | Application de bureau native. |
| **SSR** | `quasar build -m ssr` | Application web avec rendu serveur et API intégrée. |
| **SPA** | `quasar build` | Application web statique (local-uniquement). |

---

_Consultez la [Référence API](../api/README.md) pour plus de détails architecturaux._
