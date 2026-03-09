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
# Execution Modes & Deployment

The Dev Dashboard is architected to run in multiple environments. Each mode has different capabilities depending on its access to the underlying Operating System.

## ðŸ“Š Capability Comparison

| Feature | **Electron** | **SSR** | **SPA / BEX** |
| :--- | :---: | :---: | :---: |
| **Persistence** | IndexedDB + JSON | IndexedDB + JSON | IndexedDB Only |
| **File Scanning** | âœ… Full OS Access | âœ… Server-side | âŒ Not Supported |
| **Git Actions** | âœ… Native Git | âœ… Server-side | âŒ Not Supported |
| **System Stats** | âœ… Native (High) | âœ… Server-side | âŒ Not Supported |
| **Port Radar** | âœ… OS-Level Check | âœ… Server-side | âŒ Not Supported |
| **Quick Actions** | âœ… Open VS Code/Term | âœ… Server-side | âŒ Not Supported |

## ðŸ’» Electron Mode (Desktop)
The recommended way to use the dashboard for local development.
- **How it works:** Wraps the Vue app in a native window with a background Node.js process.
- **Build:** `quasar build -m electron`
- **Unique Feature:** Integrated folder picker and direct execution of system commands.

## ðŸŒ SSR Mode (Web Server)
Ideal for hosting the dashboard on a home server (e.g., a Raspberry Pi) to manage projects remotely on that machine.
- **How it works:** Runs a Node.js Express server that serves the UI and provides the API.
- **Build:** `quasar build -m ssr`
- **Consideration:** Requires the server to have Git and the target projects accessible on its local storage.

## ðŸ§Š SPA / BEX Mode (Static / Extension)
A lightweight, "Database-Only" version.
- **How it works:** Runs entirely in the browser. No backend connection is required.
- **Use Case:** Managing links and manual project metadata across machines using the **Import/Export** feature.
- **Limitation:** Cannot scan the filesystem or check real-time system stats.

## ðŸš€ Future Modes

### Capacitor & Cordova (Mobile)
- **Status:** Architecture ready, build pending.
- **Goal:** View project status and documentation on the go.
- **Storage:** Will use SQLite or IndexedDB via Capacitor plugins.

### PWA (Progressive Web App)
- **Status:** Low priority.
- **Goal:** Offline access to the bookmark library.

---

_Back to [Root README](../../README.md)_
