# Dev Dashboard

A robust, platform-agnostic development command center for managing local projects, resources, and system performance. Designed for high information density, professional aesthetics, and accessibility.

## 🚀 Key Features

### 🛠️ Project Hub (High Density)

- **Data-Rich Workspace:** Manage dozens of projects via a high-density table layout with path-based sorting.
- **Git Intelligence:** Real-time branch tracking, dirty state detection, and ahead/behind commit counts.
- **Smart Tech Detection:** Automatic identification of tech stacks (Vue, React, Node, TS, Python, Docker, etc.) with vibrant icons.
- **Port Management:**
  - Real-time active port detection.
  - Manual port pinning and conflict detection (conflicts highlighted in vibrant red).
  - In-place editing and management of pinned ports.
- **Power Actions:** Instant one-click access to VS Code, Terminal, and File Explorer.

### 📚 Resource Manager (Bookmarks)

- **Collection-Based Organization:** Categorize resources into top-level tabs (e.g., AI, DEV, DOCS).
- **Context-Aware Favorites:** A "PINNED" bar that intelligently filters based on your active collection and project context.
- **Automated Metadata:** URLs automatically fetch titles and descriptions from the web.
- **Interactive Notes:** Descriptive notes support clickable links and high-density formatting.
- **Library Management:** Multi-select batch operations and cross-platform JSON Import/Export.

### 📊 System Analytics

- **At-a-Glance Metrics:** CPU Load (with core count), RAM usage, Disk capacity, and Bandwidth tracking.
- **Live Performance:** Real-time 5-second updates with visual progress indicators for every metric.
- **Windows Optimized:** Custom load-average proxy for meaningful performance tracking on win32 systems.

### 🎨 Premium UI & UX

- **Vibrant Theming:** Adaptive Light/Dark modes using a rich `dd-` variable system.
- **Modern Depth:** Features mesh gradients, glassmorphism (dark mode), and brand-aware glows.
- **WCAG AA Compliant:** Every color and text element is tuned for 100% accessibility.
- **Deterministic Color Palette:** Consistent, vibrant coloring for tags and tech stacks.

## 🛠️ Technical Stack

- **Framework:** Quasar Framework (Vue 3, TypeScript).
- **Persistence:** Local-first IndexedDB storage with optional Backend Synchronization.
- **Platform:** Fully agnostic — runs as an **Electron Desktop App**, **SSR Server**, or **SPA Web App**.
- **Testing:** Comprehensive Cypress suite for feature verification and accessibility audits.

## 📦 Installation & Setup

```bash
# Install dependencies
npm install

# Start in development mode
quasar dev

# Build for desktop (Electron)
quasar build -m electron

# Build for web (SSR)
quasar build -m ssr
```

## ✅ Quality Standards

- **Zero-Error Policy:** 100% clean ESLint and TypeScript (tsc) verification.
- **Automated Verification:**
  - `npm run lint`: Code quality check.
  - `npx cypress run`: Runs the full feature and a11y suite.

---

_Developed for high-efficiency development environments._
