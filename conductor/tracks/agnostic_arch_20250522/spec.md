# Specification: Agnostic Architecture and SPA Mode Support

## Overview
This track aims to make the Dev Dashboard platform-agnostic by introducing a "Local-Only" (SPA/BEX) mode that functions entirely without a Node.js backend. This involves transitioning data storage from a shared `db.json` model to a strictly IndexedDB-first approach for all client modes. Additionally, a setting will be introduced to toggle system statistics for environments where they are available (SSR, Electron).

## Functional Requirements
1. **IndexedDB-First Storage:**
   - Migrate all storage logic in stores (`projectsStore`, `settingsStore`, `bookmarksStore`) to treat `IndexedDbAdapter` as the primary source of truth.
   - For SSR/Electron, continue to sync local changes to the backend `db.json` in the background (as an optional persistence layer).
   - The storage system must be agnostic, allowing for different backends in the future, with IDB as the default.
2. **SPA/Local-Only Mode:**
   - Automatically detect "Local-Only" mode based on Quasar build flags (`process.env.MODE === 'spa'`) and runtime API reachability.
   - Disable all Node.js-specific API calls (scanning, system stats, VS Code integration) when in Local-Only mode.
3. **Toggleable System Statistics:**
   - Add a "Show System Statistics" toggle in the Settings page.
   - When disabled, hide all system resource widgets (CPU, RAM, Disk) from the Dashboard and Sidebar.
   - When enabled, check if the environment supports stats (SSR, Electron) before fetching.
4. **Enhanced SPA Project Management:**
   - Allow manual entry of projects (name, "pseudo" path, and associated links) in SPA mode.
   - Support browser File System API for single-project selection/access where possible.
   - Hide the "Scan Folder" action in SPA/BEX modes.
5. **Universal Portability:**
   - Ensure the architecture remains agnostic to support future BEX, Capacitor, and Cordova modes without code modification.

## Non-Functional Requirements
- **Performance:** Ensure no UI delay when switching between local storage and backend sync.
- **Resilience:** Gracefully handle backend API failures by falling back to IndexedDB without alerting the user unnecessarily.
- **Maintainability:** Use a unified API/Service wrapper to abstract storage and OS actions.

## Acceptance Criteria
- [ ] Application starts and functions correctly in `quasar dev` (SPA mode) without a running backend server.
- [ ] Data persisted in IndexedDB remains available across page reloads in SPA mode.
- [ ] Turning off "System Statistics" in Settings hides the resource widgets on the Dashboard.
- [ ] In Electron/SSR, data still syncs to `~/.dev-dashboard/db.json` when the backend is reachable.
- [ ] "Scan Folder" button is hidden in SPA mode.

## Out of Scope
- Full PWA implementation (offline service workers).
- Direct file writing from the browser (outside of IndexedDB/browser FS API).
