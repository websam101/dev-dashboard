# Hub de Projets

Le Hub de Projets est conçu pour vous donner une vue consolidée de tous vos espaces de travail de développement.

## 🔍 Scanner des Projets
Pour remplir votre liste, vous pouvez utiliser les fonctionnalités de scan :
1. **Racines Gérées :** Configurez vos répertoires de base dans les [Paramètres](./README.md#paramètres). Cliquez ensuite sur **Scanner toutes les racines gérées** (icône Historique) pour trouver tous les projets d'un coup.
2. **Scan Manuel :** Utilisez le **Scan Manuel** (icône Loupe) pour rechercher récursivement un chemin spécifique qui n'est pas dans vos racines gérées.
3. **Saisie Manuelle :** Si vous êtes en mode SPA ou si vous souhaitez simplement suivre un lien, utilisez **Ajouter un projet** (icône Plus) pour saisir manuellement les métadonnées.

## 🌿 Intelligence Git
Le Hub suit automatiquement l'état Git de vos projets :
- **Branche :** Affiche le nom de la branche active.
- **État "Dirty" :** Une icône de crayon apparaît si vous avez des changements non validés.
- **Statut de Sync :** Les flèches Haut (↑) et Bas (↓) indiquent combien de commits vous avez d'avance ou de retard sur le serveur distant.
- **Actions :** Utilisez le menu "Plus d'actions" pour déclencher un `Git Pull` ou `Git Push` directement.

## 🔌 Gestion des Ports
- **Détection Active :** Si votre projet tourne localement, ses ports actifs seront surlignés en **vert**.
- **Conflits :** Si deux projets partagent le same port, ou si un port est utilisé par un autre processus, il sera surligné en **rouge**.
- **Épinglage :** Cliquez sur l'icône **Roue dentée** dans la colonne Ports pour "épingler" manuellement les ports que vous prévoyez d'utiliser. Cela aide à identifier les conflits avant même de lancer le projet.

## ⚡ Actions Rapides
Chaque projet dispose de raccourcis instantanés :
- **VS Code :** Ouvrez le répertoire du projet dans Visual Studio Code.
- **Terminal :** Ouvrez le terminal par défaut de votre système au chemin du projet.
- **Explorateur :** Révélez le projet dans l'Explorateur de fichiers ou le Finder.

---

_Retour au [Guide Utilisateur](./README.md)_
