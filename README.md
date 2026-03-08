# Dev Dashboard

A robust, platform-agnostic development command center for managing local projects, resources, and system performance. Designed for high information density, professional aesthetics, and accessibility.

## 🚀 Key Features

### 🛠️ Project Hub (High Density)

- **Data-Rich Workspace:** Manage dozens of projects via a high-density table layout with path-based sorting.
- **Git Intelligence:** Real-time branch tracking, dirty state detection, and ahead/behind commit counts.
- **Smart Tech Detection:** Automatic identification of tech stacks (NestJS, Next.js, Nuxt, Vue, React, Prisma, etc.).
- **Port Management:**
  - Real-time active port detection and **Port Radar** for manual availability checks.
  - Manual port pinning and **Ownership Warnings** (detects if a port is managed by another project).
  - In-place editing and management of pinned ports.
- **Power Actions:** Instant one-click access to VS Code, Terminal, and File Explorer.

### 📚 Resource Manager (Bookmarks)

- **Collection-Based Organization:** Categorize resources into top-level tabs (e.g., AI, DEV, DOCS).
- **Context-Aware Favorites:** A "PINNED" bar that intelligently filters based on active collection and project.
- **Automated Metadata:** URLs automatically fetch titles and descriptions from the web.
- **Library Management:** Multi-select batch operations and full application **Backup & Restore**.

### 📊 System Analytics

- **At-a-Glance Metrics:** CPU Load, RAM usage, Disk capacity, and Bandwidth tracking.
- **Configurable Visibility:** Toggle system stats on/off in settings to save resources.
- **OS Native Integration:** One-click access to the system's native Task Manager.

### 🎨 Premium UI & UX

- **Vibrant Glassmorphism:** Modern depth with backdrop blurs and adaptive Light/Dark modes.
- **WCAG AA Compliant:** Every color and text element is tuned for 100% accessibility.

## 🛠️ Technical Stack

- **Frontend:** Quasar Framework (Vue 3, TypeScript, Pinia).
- **Backend:** Node.js (Express) integrated via Quasar SSR Middlewares.
- **Persistence:** Agnostic architecture using **IndexedDB** (local-first) with optional **LowDB** (JSON) sync.
- **Architecture:** Platform-agnostic core supporting **Electron**, **SSR**, and **SPA** modes.

## 📖 Documentation Map

- [**Developer Guide**](./docs/en/dev/README.md): Setup, Workflow (Conductor), Testing, and Building.
- [**User Guide**](./docs/en/user/README.md): Detailed feature walkthroughs and configuration.
- [**API Reference**](./docs/en/api/README.md): Agnostic services and backend endpoint documentation.
- [**Modes & Deployment**](./docs/en/modes/README.md): Detailed comparison of Electron, SSR, and SPA capabilities.

## 📦 Quick Start

```bash
# Install dependencies
npm install

# Start in development mode (detects mode automatically)
quasar dev -m electron  # Desktop
quasar dev -m ssr       # Web Server
quasar dev              # SPA (Static)

# Build for different targets
quasar build -m electron  # Desktop
quasar build -m ssr       # Web Server
quasar build              # SPA (Static)

# Run full test suite
npm run test:unit  # Vitest
npm run test:e2e   # Cypress
```

## ✅ Quality Standards

- **Zero-Error Policy:** 100% clean ESLint and TypeScript verification.
- **Automated Verification:**
  - `npm run lint`: Code quality check.
  - `npm test`: Runs all unit and E2E tests.

---

_Developed for high-efficiency development environments._
