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
# Gestion d'Ã‰tat (Pinia)

L'application utilise **Pinia** pour la gestion centralisÃ©e de l'Ã©tat. Chaque store est responsable d'un domaine spÃ©cifique et interagit avec l'`AgnosticDataService` pour la persistance.

## ðŸ“¦ AperÃ§u des Stores

### 1. `settingsStore`
GÃ¨re la configuration de l'application (Mode Sombre, Langue, visibilitÃ© des Stats SystÃ¨me).
- **Persistance :** Se synchronise automatiquement vers IndexedDB et le backend JSON lors d'un changement.
- **Action ClÃ© :** `init()` - Charge les paramÃ¨tres et applique le thÃ¨me.

### 2. `projectsStore`
GÃ¨re la liste des projets locaux suivis.
- **Persistance :** Utilise `AgnosticDataService` pour sauvegarder les mÃ©tadonnÃ©es des projets.
- **Intelligence :** DÃ©clenche les actions de scan et de synchronisation Git via l'API backend.
- **Action ClÃ© :** `addManualProject()` - Permet d'ajouter des projets sans accÃ¨s au systÃ¨me de fichiers.

### 3. `bookmarksStore`
GÃ¨re la bibliothÃ¨que de ressources, incluant les collections et les liens favoris.
- **Structure :** `Collection` -> `Favori`.
- **MÃ©tadonnÃ©es :** Interagit avec le backend pour rÃ©cupÃ©rer les titres et descriptions des URLs.

### 4. `systemStore`
GÃ¨re les donnÃ©es de performance systÃ¨me en temps rÃ©el.
- **RÃ©actif :** Se met Ã  jour toutes les 5 secondes lorsque le paramÃ¨tre "Afficher les statistiques systÃ¨me" est activÃ©.
- **CapacitÃ©s :** Relaye les actions de niveau OS comme la vÃ©rification des ports et l'ouverture du Gestionnaire de tÃ¢ches.

## ðŸ”„ Interactions entre Stores

Les stores dÃ©pendent souvent les uns des autres ou de services partagÃ©s :

```mermaid
graph LR
    UI[Composants Vue] --> PS[projectsStore]
    UI --> SS[settingsStore]
    UI --> BS[bookmarksStore]
    PS --> ADS[AgnosticDataService]
    BS --> ADS
    SS --> ADS
    systemStore --> API[API Backend]
```

## ðŸ§ª Tester les Stores
Chaque store possÃ¨de un fichier `.spec.ts` correspondant. Nous utilisons `createTestingPinia` pour mocker les dÃ©pendances lors des tests unitaires.

---

_Consultez le [Guide DÃ©veloppeur](../dev/README.md) pour les commandes de build et de test._
