# Execution Modes & Deployment

The Dev Dashboard is architected to run in multiple environments. Each mode has different capabilities depending on its access to the underlying Operating System.

## 📊 Capability Comparison

| Feature | **Electron** | **SSR** | **SPA / BEX** |
| :--- | :---: | :---: | :---: |
| **Persistence** | IndexedDB + JSON | IndexedDB + JSON | IndexedDB Only |
| **File Scanning** | ✅ Full OS Access | ✅ Server-side | ❌ Not Supported |
| **Git Actions** | ✅ Native Git | ✅ Server-side | ❌ Not Supported |
| **System Stats** | ✅ Native (High) | ✅ Server-side | ❌ Not Supported |
| **Port Radar** | ✅ OS-Level Check | ✅ Server-side | ❌ Not Supported |
| **Quick Actions** | ✅ Open VS Code/Term | ✅ Server-side | ❌ Not Supported |

## 💻 Electron Mode (Desktop)
The recommended way to use the dashboard for local development.
- **How it works:** Wraps the Vue app in a native window with a background Node.js process.
- **Build:** `quasar build -m electron`
- **Unique Feature:** Integrated folder picker and direct execution of system commands.

## 🌐 SSR Mode (Web Server)
Ideal for hosting the dashboard on a home server (e.g., a Raspberry Pi) to manage projects remotely on that machine.
- **How it works:** Runs a Node.js Express server that serves the UI and provides the API.
- **Build:** `quasar build -m ssr`
- **Consideration:** Requires the server to have Git and the target projects accessible on its local storage.

## 🧊 SPA / BEX Mode (Static / Extension)
A lightweight, "Database-Only" version.
- **How it works:** Runs entirely in the browser. No backend connection is required.
- **Use Case:** Managing links and manual project metadata across machines using the **Import/Export** feature.
- **Limitation:** Cannot scan the filesystem or check real-time system stats.

## 🚀 Future Modes

### Capacitor & Cordova (Mobile)
- **Status:** Architecture ready, build pending.
- **Goal:** View project status and documentation on the go.
- **Storage:** Will use SQLite or IndexedDB via Capacitor plugins.

### PWA (Progressive Web App)
- **Status:** Low priority.
- **Goal:** Offline access to the bookmark library.

---

_Back to [Root README](../../README.md)_
