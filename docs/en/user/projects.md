# Projects Hub

The Projects Hub is designed to give you a consolidated view of all your development workspaces.

## 🔍 Scanning for Projects
To populate your list, you can use the scanning features:
1. **Managed Roots:** Set up your base code directories in [Settings](./README.md#settings). Then click **Scan all managed roots** (History icon) to find all projects at once.
2. **Manual Scan:** Use the **Manual Scan** (Magnify icon) to recursively search a specific path not in your managed roots.
3. **Manual Entry:** If you are in SPA mode or just want to track a link, use **Add Project** (Plus icon) to manually enter metadata.

## 🌿 Git Intelligence
The Hub automatically tracks the Git state of your projects:
- **Branch:** Displays the active branch name.
- **Dirty State:** A pencil icon appears if you have uncommitted changes.
- **Sync Status:** Up (↑) and Down (↓) arrows show how many commits you are ahead or behind the remote.
- **Actions:** Use the "More Actions" menu to trigger `Git Pull` or `Git Push` directly.

## 🔌 Port Management
- **Active Detection:** If your project is running locally, its active ports will be highlighted in **green**.
- **Conflicts:** If two projects share the same port, or if a port is in use by another process, it will be highlighted in **red**.
- **Pinning:** Click the **Cog** icon in the Ports column to manually "pin" ports you expect your project to use. This helps identify conflicts before you even start the project.

## ⚡ Quick Actions
Every project has instant shortcuts:
- **VS Code:** Open the project directory in Visual Studio Code.
- **Terminal:** Open your system's default terminal at the project path.
- **Explorer:** Reveal the project in File Explorer or Finder.

---

_Back to [User Guide](./README.md)_
