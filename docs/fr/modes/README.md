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
# Modes d'ExÃ©cution & DÃ©ploiement

Le Dev Dashboard est conÃ§u pour s'adapter Ã  plusieurs environnements. Chaque mode offre des capacitÃ©s diffÃ©rentes selon son accÃ¨s au systÃ¨me d'exploitation hÃ´te.

## ðŸ“Š Comparaison des CapacitÃ©s

| FonctionnalitÃ© | **Electron** | **SSR** | **SPA / BEX** |
| :--- | :---: | :---: | :---: |
| **Persistance** | IndexedDB + JSON | IndexedDB + JSON | IndexedDB Uniquement |
| **Scan de Fichiers** | âœ… AccÃ¨s OS Total | âœ… CÃ´tÃ© Serveur | âŒ Non SupportÃ© |
| **Actions Git** | âœ… Git Natif | âœ… CÃ´tÃ© Serveur | âŒ Non SupportÃ© |
| **Stats SystÃ¨me** | âœ… Natif (PrÃ©cis) | âœ… CÃ´tÃ© Serveur | âŒ Non SupportÃ© |
| **Radar de Port** | âœ… Niveau OS | âœ… CÃ´tÃ© Serveur | âŒ Non SupportÃ© |
| **Actions Rapides** | âœ… VS Code/Term | âœ… CÃ´tÃ© Serveur | âŒ Non SupportÃ© |

## ðŸ’» Mode Electron (Bureau)
La mÃ©thode recommandÃ©e pour utiliser le tableau de bord en dÃ©veloppement local.
- **Fonctionnement :** Enveloppe l'app Vue dans une fenÃªtre native avec un processus Node.js en arriÃ¨re-plan.
- **Build :** `quasar build -m electron`
- **Atout :** SÃ©lecteur de dossiers intÃ©grÃ© et exÃ©cution directe de commandes systÃ¨me.

## ðŸŒ Mode SSR (Serveur Web)
IdÃ©al pour hÃ©berger le tableau de bord sur un serveur personnel (ex: Raspberry Pi) afin de gÃ©rer des projets distants sur cette machine.
- **Fonctionnement :** Lance un serveur Node.js Express qui sert l'interface et fournit l'API.
- **Build :** `quasar build -m ssr`
- **Note :** NÃ©cessite que Git soit installÃ© sur le serveur et que les projets soient accessibles sur son stockage local.

## ðŸ§Š Mode SPA / BEX (Statique / Extension)
Une version lÃ©gÃ¨re, concentrÃ©e sur la base de donnÃ©es locale.
- **Fonctionnement :** S'exÃ©cute entiÃ¨rement dans le navigateur. Aucune connexion backend n'est requise.
- **Usage :** Gestion de liens et de mÃ©tadonnÃ©es de projets manuels, synchronisÃ©s via l'**Import/Export**.
- **Limite :** Ne peut pas scanner le systÃ¨me de fichiers ni vÃ©rifier les stats systÃ¨me en temps rÃ©el.

## ðŸš€ Modes Futurs

### Capacitor & Cordova (Mobile)
- **Statut :** Architecture prÃªte, build en attente.
- **Objectif :** Consulter l'Ã©tat des projets et la doc en mobilitÃ©.

### PWA (Progressive Web App)
- **Statut :** Basse prioritÃ©.
- **Objectif :** AccÃ¨s hors-ligne Ã  la bibliothÃ¨que de favoris.

---

_Retour au [README principal](../../README.fr.md)_
