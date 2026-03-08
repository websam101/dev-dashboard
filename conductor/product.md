# Initial Concept
A comprehensive "Dev Dashboard" for developers to manage their local projects, git repositories, active ports, and bookmarks in a single interface.

# Product Definition - Dev Dashboard

## Vision
To provide a unified, local-first command center for developers, bridging the gap between browser-based development and the local operating system.

## Target Audience
- Full-stack developers managing multiple local projects.
- Developers who need quick access to system resources, git status, and documentation links.
- Users who prefer a beautiful, dark-themed dashboard over fragmented terminal commands and browser tabs.

## Core Features
- **Project Hub:** Scan and track local project directories or manually add project entries for web-only environments.
- **Git Integration:** View current branch, dirty status, and sync status (ahead/behind) across all tracked repositories.
- **System Monitoring:** Real-time visualization of CPU load, RAM usage, disk space, and system uptime (configurable).
- **Bookmark Manager:** Organize technical documentation and project-related links with automatic favicon rendering.
- **Port Manager:** Monitor active network ports and check availability via a dedicated Port Radar with proactive ownership warnings.
- **Quick Actions:** One-click shortcuts to open projects in VS Code, terminal, or file explorer.
- **Universal Support:** Runs as a native desktop app (Electron), server-rendered web app (SSR), or standalone static site (SPA/BEX).

## Design Principles
- **Developer Focus:** High-contrast dark mode by default.
- **Performance:** Local-first architecture using IndexedDB for instant data availability.
- **Resilience:** Defensive error handling for OS-level operations to prevent UI hangs.
