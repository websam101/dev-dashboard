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
# Developer Guide

Welcome to the Dev Dashboard development guide. This document covers the technical setup, development workflow, and quality standards for the project.

## ðŸ› ï¸ Environment Setup

### Prerequisites
- **Node.js:** v20+ (LTS recommended)
- **NPM:** v10+
- **Quasar CLI:** Global installation is optional but recommended.
  ```bash
  npm install -g @quasar/cli
  ```

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

## ðŸ”„ Development Workflow

The project follows a **Spec-Driven Development** methodology managed by **Conductor**.

### Conductor Protocols
- **`/conductor:setup`**: Initializes the Conductor environment (Product, Tech Stack, Workflow).
- **`/conductor:implement`**: Automatically processes the next pending track in the `Tracks Registry`.
- **`/conductor:review`**: Generates a summary of changes for peer review.

### Coding Standards
- **Agnostic Logic:** Never import Node.js modules (like `fs`, `path`, `child_process`) directly into frontend components. Use the service layer and capability detection.
- **Strict Typing:** 100% TypeScript coverage. Avoid `any` unless absolutely necessary for low-level mocks.
- **i18n Mandatory:** Never hardcode text in the UI. All strings must reside in `src/i18n/`.

## ðŸ§ª Testing & Verification

### Unit Testing (Vitest)
Unit tests are used for stores, services, and utility logic.
- **Run all tests:** `npm run test:unit`
- **Run specific test:** `npx vitest run src/path/to/test.spec.ts`

### End-to-End Testing (Cypress)
Cypress is used for feature verification and accessibility (a11y) audits.
- **Open Cypress UI:** `npx cypress open`
- **Run headless suite:** `npx cypress run`

### Linting
We use ESLint with specific rules for Vue 3 and TypeScript.
- **Check code:** `npm run lint`

## ðŸ—ï¸ Build Commands

The application can be built for different targets:

| Mode | Command | Description |
| :--- | :--- | :--- |
| **Electron** | `quasar build -m electron` | Native desktop application. |
| **SSR** | `quasar build -m ssr` | Server-side rendered web app with integrated API. |
| **SPA** | `quasar build` | Static single-page application (local-only). |

---

_Refer to the [API Reference](../api/README.md) for deeper architectural details._
