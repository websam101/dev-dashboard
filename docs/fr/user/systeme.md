# Suivi Système

Suivez en temps réel les performances de votre machine hôte pour identifier les goulots d'étranglement ou les conflits de ressources.

## 📊 Indicateurs de Ressources
Le tableau de bord affiche trois moniteurs principaux :
1. **CPU :** Pourcentage de charge totale sur l'ensemble de vos cœurs. Sur Windows, nous utilisons un proxy intelligent pour fournir une métrique de charge significative.
2. **RAM :** Utilisation de la mémoire vive en Go et en pourcentage.
3. **Disque :** Espace utilisé sur votre partition principale (généralement `C:` ou `/`).

## 📡 Trafic Réseau
Visualisez le cumul des données envoyées et reçues depuis le dernier démarrage du système. Utile pour vérifier si un projet consomme de la bande passante de manière inattendue.

## 🖥️ Gestionnaire de Tâches
Une icône **Moniteur** est disponible dans l'en-tête du tableau de bord. Un clic sur celle-ci ouvre instantanément l'outil natif de votre système :
- **Windows :** Gestionnaire des tâches (`taskmgr.exe`).
- **macOS :** Moniteur d'activité.
- **Linux :** GNOME System Monitor (ou équivalent).

## ⚙️ Configuration
Vous pouvez personnaliser l'affichage du suivi système dans les [Paramètres](./README.md#paramètres) :
- **Afficher les statistiques :** Activez ou désactivez complètement les moniteurs pour libérer de l'espace visuel ou économiser des ressources.
- **Vérification Auto des Ports :** Permet à l'application de scanner périodiquement les ports réseau de vos projets en arrière-plan.

---

_Retour au [Guide Utilisateur](./README.md)_
