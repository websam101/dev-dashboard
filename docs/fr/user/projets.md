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
# Hub de Projets

Le Hub de Projets est conÃ§u pour vous donner une vue consolidÃ©e de tous vos espaces de travail de dÃ©veloppement.

## ðŸ” Scanner des Projets
Pour remplir votre liste, vous pouvez utiliser les fonctionnalitÃ©s de scan :
1. **Racines GÃ©rÃ©es :** Configurez vos rÃ©pertoires de base dans les [ParamÃ¨tres](./README.md#paramÃ¨tres). Cliquez ensuite sur **Scanner toutes les racines gÃ©rÃ©es** (icÃ´ne Historique) pour trouver tous les projets d'un coup.
2. **Scan Manuel :** Utilisez le **Scan Manuel** (icÃ´ne Loupe) pour rechercher rÃ©cursivement un chemin spÃ©cifique qui n'est pas dans vos racines gÃ©rÃ©es.
3. **Saisie Manuelle :** Si vous Ãªtes en mode SPA ou si vous souhaitez simplement suivre un lien, utilisez **Ajouter un projet** (icÃ´ne Plus) pour saisir manuellement les mÃ©tadonnÃ©es.

## ðŸŒ¿ Intelligence Git
Le Hub suit automatiquement l'Ã©tat Git de vos projets :
- **Branche :** Affiche le nom de la branche active.
- **Ã‰tat "Dirty" :** Une icÃ´ne de crayon apparaÃ®t si vous avez des changements non validÃ©s.
- **Statut de Sync :** Les flÃ¨ches Haut (â†‘) et Bas (â†“) indiquent combien de commits vous avez d'avance ou de retard sur le serveur distant.
- **Actions :** Utilisez le menu "Plus d'actions" pour dÃ©clencher un `Git Pull` ou `Git Push` directement.

## ðŸ”Œ Gestion des Ports
- **DÃ©tection Active :** Si votre projet tourne localement, ses ports actifs seront surlignÃ©s en **vert**.
- **Conflits :** Si deux projets partagent le same port, ou si un port est utilisÃ© par un autre processus, il sera surlignÃ© en **rouge**.
- **Ã‰pinglage :** Cliquez sur l'icÃ´ne **Roue dentÃ©e** dans la colonne Ports pour "Ã©pingler" manuellement les ports que vous prÃ©voyez d'utiliser. Cela aide Ã  identifier les conflits avant mÃªme de lancer le projet.

## âš¡ Actions Rapides
Chaque projet dispose de raccourcis instantanÃ©s :
- **VS Code :** Ouvrez le rÃ©pertoire du projet dans Visual Studio Code.
- **Terminal :** Ouvrez le terminal par dÃ©faut de votre systÃ¨me au chemin du projet.
- **Explorateur :** RÃ©vÃ©lez le projet dans l'Explorateur de fichiers ou le Finder.

---

_Retour au [Guide Utilisateur](./README.md)_
