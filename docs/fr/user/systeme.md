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
# Suivi SystÃ¨me

Suivez en temps rÃ©el les performances de votre machine hÃ´te pour identifier les goulots d'Ã©tranglement ou les conflits de ressources.

## ðŸ“Š Indicateurs de Ressources
Le tableau de bord affiche trois moniteurs principaux :
1. **CPU :** Pourcentage de charge totale sur l'ensemble de vos cÅ“urs. Sur Windows, nous utilisons un proxy intelligent pour fournir une mÃ©trique de charge significative.
2. **RAM :** Utilisation de la mÃ©moire vive en Go et en pourcentage.
3. **Disque :** Espace utilisÃ© sur votre partition principale (gÃ©nÃ©ralement `C:` ou `/`).

## ðŸ“¡ Trafic RÃ©seau
Visualisez le cumul des donnÃ©es envoyÃ©es et reÃ§ues depuis le dernier dÃ©marrage du systÃ¨me. Utile pour vÃ©rifier si un projet consomme de la bande passante de maniÃ¨re inattendue.

## ðŸ–¥ï¸ Gestionnaire de TÃ¢ches
Une icÃ´ne **Moniteur** est disponible dans l'en-tÃªte du tableau de bord. Un clic sur celle-ci ouvre instantanÃ©ment l'outil natif de votre systÃ¨me :
- **Windows :** Gestionnaire des tÃ¢ches (`taskmgr.exe`).
- **macOS :** Moniteur d'activitÃ©.
- **Linux :** GNOME System Monitor (ou Ã©quivalent).

## âš™ï¸ Configuration
Vous pouvez personnaliser l'affichage du suivi systÃ¨me dans les [ParamÃ¨tres](./README.md#paramÃ¨tres) :
- **Afficher les statistiques :** Activez ou dÃ©sactivez complÃ¨tement les moniteurs pour libÃ©rer de l'espace visuel ou Ã©conomiser des ressources.
- **VÃ©rification Auto des Ports :** Permet Ã  l'application de scanner pÃ©riodiquement les ports rÃ©seau de vos projets en arriÃ¨re-plan.

---

_Retour au [Guide Utilisateur](./README.md)_
