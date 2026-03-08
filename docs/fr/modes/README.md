# Modes d'Exécution & Déploiement

Le Dev Dashboard est conçu pour s'adapter à plusieurs environnements. Chaque mode offre des capacités différentes selon son accès au système d'exploitation hôte.

## 📊 Comparaison des Capacités

| Fonctionnalité | **Electron** | **SSR** | **SPA / BEX** |
| :--- | :---: | :---: | :---: |
| **Persistance** | IndexedDB + JSON | IndexedDB + JSON | IndexedDB Uniquement |
| **Scan de Fichiers** | ✅ Accès OS Total | ✅ Côté Serveur | ❌ Non Supporté |
| **Actions Git** | ✅ Git Natif | ✅ Côté Serveur | ❌ Non Supporté |
| **Stats Système** | ✅ Natif (Précis) | ✅ Côté Serveur | ❌ Non Supporté |
| **Radar de Port** | ✅ Niveau OS | ✅ Côté Serveur | ❌ Non Supporté |
| **Actions Rapides** | ✅ VS Code/Term | ✅ Côté Serveur | ❌ Non Supporté |

## 💻 Mode Electron (Bureau)
La méthode recommandée pour utiliser le tableau de bord en développement local.
- **Fonctionnement :** Enveloppe l'app Vue dans une fenêtre native avec un processus Node.js en arrière-plan.
- **Build :** `quasar build -m electron`
- **Atout :** Sélecteur de dossiers intégré et exécution directe de commandes système.

## 🌐 Mode SSR (Serveur Web)
Idéal pour héberger le tableau de bord sur un serveur personnel (ex: Raspberry Pi) afin de gérer des projets distants sur cette machine.
- **Fonctionnement :** Lance un serveur Node.js Express qui sert l'interface et fournit l'API.
- **Build :** `quasar build -m ssr`
- **Note :** Nécessite que Git soit installé sur le serveur et que les projets soient accessibles sur son stockage local.

## 🧊 Mode SPA / BEX (Statique / Extension)
Une version légère, concentrée sur la base de données locale.
- **Fonctionnement :** S'exécute entièrement dans le navigateur. Aucune connexion backend n'est requise.
- **Usage :** Gestion de liens et de métadonnées de projets manuels, synchronisés via l'**Import/Export**.
- **Limite :** Ne peut pas scanner le système de fichiers ni vérifier les stats système en temps réel.

## 🚀 Modes Futurs

### Capacitor & Cordova (Mobile)
- **Statut :** Architecture prête, build en attente.
- **Objectif :** Consulter l'état des projets et la doc en mobilité.

### PWA (Progressive Web App)
- **Statut :** Basse priorité.
- **Objectif :** Accès hors-ligne à la bibliothèque de favoris.

---

_Retour au [README principal](../../README.fr.md)_
