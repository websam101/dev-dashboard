# Dev Dashboard Remake Roadmap (Quasar SSR/Electron)

## 1. Unified Backend Strategy
Instead of separate backends, we will use Quasar's **SSR Middlewares** as our API layer.
- **Service Layer:** `src/services/server/` will contain pure Node.js modules for:
    - `SystemMonitor.ts`: CPU, RAM, Disk, Uptime.
    - `ProjectManager.ts`: File scanning, Port correlation, Git metadata.
    - `ActionExecutor.ts`: `code .`, `terminal`, `browser` (using `cross-spawn`).
- **Persistence:** `lowdb` (JSON-based) stored in user's home directory (`~/.dev-dashboard/config.json`) for persistence across versions.

## 2. Page & UI Overhaul

### Home / Dashboard
- **Goal:** High-level status and shortcuts.
- **Components:**
    - **System Summary:** Working stats (not just placeholders).
    - **Active Ports Card:** Real-time view of what's running.
    - **Recent Projects:** Direct links to the last 3 worked projects.

### Projects Dashboard (The Hub)
- **Goal:** Single source of truth for dev work.
- **Features:**
    - **Unified List:** Each item is a Project + Git Status + Assigned Ports.
    - **Project-Specific Bookmarks:** Quick links (Docs, Localhost, Staging) attached to the project.
    - **Git Integration:** Pull/Push/Sync status indicator without leaving the page.
    - **Quick Actions:** Moved here (Open VS Code, Open Folder, Terminal).

### Bookmarks Manager
- **Goal:** Tab overload prevention.
- **Layout:** Subject-based Cards (e.g., "AI Tools", "Frontend Docs", "Client X", "Network").
- **Integration:** Ability to tag a bookmark category to show up on the relevant Project card.

### Settings
- **Goal:** Real configuration.
- **Features:**
    - **Scan Roots:** Define directories where projects live (auto-discovery).
    - **Custom Actions:** Define what "Terminal" or "Code" actually runs.
    - **Export/Import:** Move your setup between machines.

## 3. Implementation Phases

### Phase 1: The "Real" Backend
- [ ] Create `src/services/server/` services.
- [ ] Implement `src-ssr/middlewares/api.ts`.
- [ ] Test API endpoints locally.

### Phase 2: Project Centralization
- [ ] Merge `ProjectsView.vue`, `GitManagerView.vue`, and `PortManagerView.vue` into a single, high-performance `ProjectsView.vue`.
- [ ] Implement auto-scanning for projects.

### Phase 3: Bookmarks & Home
- [ ] Rebuild `BookmarksView.vue` as a dashboard of cards.
- [ ] Connect Homepage stats to the real backend data.

### Phase 4: Electron Integration
- [ ] Ensure Electron uses the same API endpoints (via the same SSR middleware or IPC).

## 4. Open Questions
1. **Credentials:** For Git credentials, should we rely on the OS's credential manager (SSH/HTTPS) or do you want to store them in the app (not recommended)?
2. **Icons:** For project techs (Vue, Node, etc.), would you like auto-detection (searching for `package.json` dependencies) or manual selection?
