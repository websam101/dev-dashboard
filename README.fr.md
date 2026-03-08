# Dev Dashboard (Tableau de Bord Dev)

Un centre de commandement robuste et agnostique pour la gestion de vos projets locaux, de vos ressources et des performances de votre système. Conçu pour une haute densité d'informations, une esthétique professionnelle et une accessibilité totale.

## 🚀 Fonctionnalités Clés

### 🛠️ Hub de Projets (Haute Densité)

- **Espace de Travail Riche :** Gérez des dizaines de projets via une table haute densité avec tri par chemin.
- **Intelligence Git :** Suivi en temps réel des branches, détection des changements non validés et compteurs de commits d'avance/retard.
- **Détection Technique Intelligente :** Identification automatique des stacks techniques (NestJS, Next.js, Nuxt, Vue, React, Prisma, etc.).
- **Gestion des Ports :**
  - Détection des ports actifs en temps réel et **Radar de Port** pour les vérifications manuelles.
  - Épinglage manuel des ports et **Avertissements de Propriété** (détecte si un port est géré par un autre projet).
- **Actions Rapides :** Accès instantané en un clic à VS Code, au Terminal et à l'Explorateur de fichiers.

### 📚 Gestionnaire de Ressources (Favoris)

- **Organisation par Collection :** Catégorisez vos ressources dans des onglets de haut niveau (ex: IA, DEV, DOCS).
- **Favoris Contextuels :** Une barre "ÉPINGLÉS" qui filtre intelligemment selon la collection active et le projet.
- **Métadonnées Automatiques :** Les URLs récupèrent automatiquement les titres et descriptions sur le web.
- **Gestion de Bibliothèque :** Opérations groupées et système complet de **Sauvegarde et Restauration**.

### 📊 Analyses Système

- **Métriques en un coup d'œil :** Charge CPU, utilisation RAM, capacité Disque et suivi de la bande passante.
- **Visibilité Configurable :** Activez ou désactivez les stats système dans les paramètres pour économiser les ressources.
- **Intégration Native OS :** Accès en un clic au Gestionnaire de tâches natif de votre système.

### 🎨 UI & UX Premium

- **Glassmorphism Vibrant :** Profondeur moderne avec flous d'arrière-plan et modes Clair/Sombre adaptatifs.
- **Conforme WCAG AA :** Chaque couleur et élément de texte est ajusté pour une accessibilité à 100%.

## 🛠️ Stack Technique

- **Frontend :** Quasar Framework (Vue 3, TypeScript, Pinia).
- **Backend :** Node.js (Express) intégré via les Middlewares Quasar SSR.
- **Persistance :** Architecture agnostique utilisant **IndexedDB** (local-first) avec synchronisation optionnelle **LowDB** (JSON).
- **Architecture :** Cœur agnostique supportant les modes **Electron**, **SSR**, et **SPA**.

## 📖 Carte de la Documentation

- [**Guide Développeur**](./docs/fr/dev/README.md) : Installation, Flux de travail (Conductor), Tests et Build.
- [**Guide Utilisateur**](./docs/fr/user/README.md) : Walkthrough détaillé des fonctionnalités et configuration.
- [**Référence API**](./docs/fr/api/README.md) : Documentation des services agnostiques et des endpoints backend.
- [**Modes & Déploiement**](./docs/fr/modes/README.md) : Comparaison détaillée des capacités Electron, SSR et SPA.

## 📦 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
quasar dev

# Lancer la suite de tests complète
npm run test:unit  # Vitest
npm run test:e2e   # Cypress
```

---

_Développé pour les environnements de développement à haute efficacité._
