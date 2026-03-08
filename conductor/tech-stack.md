# Tech Stack - Dev Dashboard

## Core Philosophy: Agnosticism
- **Platform Agnostic:** The application is architected to run seamlessly across Web (SSR), Desktop (Electron), and potentially mobile environments.
- **Environment Agnostic:** Unified `AgnosticDataService` and capability detection ensure the application remains functional even when OS-level integrations (Node.js) are unavailable.
- **Reliability First:** A comprehensive testing strategy ensures stability across all supported platforms, targeting 100% code coverage for core logic.

## Core Technologies
- **TypeScript:** Primary language for both frontend and backend logic, ensuring type safety across the application.
- **Quasar Framework (Vue 3):** Chosen for its extensive UI component library, built-in SSR/Electron support, and developer productivity features.
- **Node.js / Express:** Serves as the backend API layer, providing access to the underlying operating system.

## Frontend
- **Vue 3 (Composition API):** Modern reactive frontend framework.
- **Pinia:** Centralized state management for application data (projects, stats, bookmarks).
- **Vue Router:** Client-side routing for the SPA.
- **Vue I18n:** Internationalization support for a localizable UI.
- **Axios:** HTTP client for communicating with the local API server.

## Backend & OS Integration
- **Quasar SSR/Electron Middlewares:** Integrated Express server for handling OS-level requests.
- **systeminformation:** Comprehensive library for retrieving hardware and system statistics.
- **simple-git:** Lightweight wrapper for executing Git commands.
- **cross-spawn:** Cross-platform solution for spawning child processes (e.g., opening VS Code).

## Persistence
- **IndexedDB (idb):** High-performance, client-side database for project metadata and bookmarks.
- **lowdb:** Simple, JSON-based database for persistent backend settings stored in the user's home directory.

## Development Tools
- **ESLint:** Pluggable linting utility for maintaining code quality.
- **Vite:** Fast frontend build tool and dev server.
- **Electron Packager/Builder:** Tools for bundling the application as a desktop executable.
- **Vitest:** Blazing fast unit test framework powered by Vite.
- **@vitest/coverage-v8:** Native V8 code coverage provider for accurate reporting.
- **@vue/test-utils:** Official utility library for Vue.js component testing.
- **@pinia/testing:** Utilities for testing Pinia stores.
