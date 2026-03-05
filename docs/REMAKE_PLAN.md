# Dev Dashboard Remake Plan

## 1. Executive Summary
The current application suffers from a critical architectural flaw: it attempts to execute Node.js commands (like `child_process` for Git and System stats) directly in the browser (Vue/Vite components). This causes the app to fail silently or crash.

The remake will transition the application to a **Client-Server Architecture** (or Electron) to properly handle OS-level operations. It will also overhaul the UI to focus on a "Developer Home Lab" experience, consolidating fragmented features into cohesive dashboards.

## 2. Core Architecture
**Current State:** Single Page Application (SPA) trying to access OS directly.
**Target State:**
*   **Backend (Local API Server):** A lightweight Node.js server (Express/Fastify) running locally.
    *   Responsibilities: File system access, Git commands, Port scanning (`netstat`/`lsof`), System stats (`os` module), Persistence (JSON/SQLite).
*   **Frontend (Quasar/Vue):** A pure UI layer that consumes the API.
    *   Responsibilities: Displaying data, sending commands to the server, Managing state (Pinia).

*Alternative:* **Electron App.** This wraps the frontend and backend into a single installable executable. This is often better for "Opening VS Code" or "Launching Terminals" seamlessly.

## 3. Feature Roadmap

### Phase 1: Foundation & Backend
*   [ ] **Initialize Server:** Set up a simple Node.js server script.
*   [ ] **API Design:**
    *   `GET /api/system/stats`: CPU/RAM usage.
    *   `GET /api/projects`: Load projects from config.
    *   `POST /api/projects/scan`: Auto-discover projects in a directory.
    *   `POST /api/open`: Handle `code .`, `xdg-open`, etc.
*   [ ] **Store Migration:** Update Pinia stores (`gitStore`, `projectStore`) to fetch from API instead of using `child_process`.

### Phase 2: UI Overhaul & Consolidation
*   [ ] **Global Layout:**
    *   Dark mode by default (Developer focus).
    *   Sidebar navigation.
*   [ ] **Projects Dashboard (The Core):**
    *   **Consolidated View:** Combine "Projects", "Ports", and "Git" into one powerful table/grid.
    *   **Project Card:**
        *   Name & Path.
        *   **Status Indicators:** Running Port (Green/Red), Git Status (Clean/Dirty/Ahead).
        *   **Quick Actions:** Open VS Code, Open Terminal, Open Browser (Localhost).
        *   **Tech Stack:** Icons (Vue, Node, Python) linked to their documentation.
*   [ ] **Port Viewer:**
    *   Move from a standalone manager to a "Diagnostics" tool.
    *   Auto-correlate running ports to known projects.

### Phase 3: Bookmarks Manager
*   [ ] **New Data Structure:** `Category` -> `Bookmark`.
*   [ ] **UI Layout:** Masonry/Grid of Cards (one card per subject/client).
*   [ ] **Project Integration:** Allow "Pinning" a bookmark category to a specific Project Card.
*   [ ] **Smart Discovery:** "You seem to use Vue.js, here are the Vue 3 docs."

### Phase 4: Git & Settings
*   [ ] **Git Manager:**
    *   Background poller to check status of all projects.
    *   "Sync All" button (careful implementation).
*   [ ] **Settings:**
    *   Configuration for "Projects Root Directory" (to auto-scan).
    *   Theme toggles.
    *   Backup/Restore data.

## 4. Questions for the User
1.  **Architecture Preference:** Do you prefer this as a **Web App** (running in Chrome, backed by a local server command like `npm start`) OR as an **Electron Desktop App** (one `.exe` file)?
    *   *Electron* is usually better for "Desktop Integrations" like opening terminals.
    *   *Web App* is better if you want to access this dashboard from your phone/tablet on the same network.
2.  **OS Specifics:** You mentioned `win32`. Do you use WSL (Windows Subsystem for Linux) or standard PowerShell/CMD for your dev work? This affects how we run `ls`, `grep`, and `git`.

## 5. Next Steps
1.  Confirm Architecture.
2.  Scaffold the Backend (or Electron main process).
3.  Begin UI consolidation.
