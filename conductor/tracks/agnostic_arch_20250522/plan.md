# Implementation Plan: Agnostic Architecture and Universal Storage

## Phase 1: Storage and API Abstraction (The "Agnostic" Core) [checkpoint: 86d5ca1]
- [x] Task: Create a `StorageAdapter` interface and an `AgnosticDataService` to abstract DB operations from Pinia stores.
    - [x] Define `StorageAdapter` interface (`src/services/db/types.ts`).
    - [x] Refactor `IndexedDbAdapter.ts` to implement this interface.
    - [x] Create `AgnosticDataService.ts` to orchestrate between local adapter and optional backend sync.
- [x] Task: Update `boot/api.ts` to include platform capability detection.
    - [x] Add `hasBackend` and `hasFileSystem` flags based on `process.env.MODE` and runtime checks.
- [x] Task: Implement backend API for opening the system task manager.
    - [x] Add `openTaskManager()` to `ActionExecutor.ts` (OS-specific commands).
    - [x] Expose `/api/actions/open-task-manager` in SSR/Electron middlewares.
- [x] Task: Implement backend API for port checking.
    - [x] Add `checkPort(port: number)` to `SystemMonitor.ts`.
    - [x] Expose `/api/utils/check-port` in SSR/Electron middlewares.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Storage and API Abstraction' (Protocol in workflow.md)

## Phase 2: Store Migration and Capability Awareness [checkpoint: 1f9c6aa]
- [x] Task: Refactor `settingsStore.ts` to use `AgnosticDataService` and include `showSystemStats` setting.
    - [x] Add `showSystemStats` to `Settings` interface.
    - [x] Update TDD tests for `settingsStore`.
- [x] Task: Refactor `projectsStore.ts` to use `AgnosticDataService` and honor platform capabilities.
    - [x] Update `loadProjects` and `syncAll` to respect `hasBackend` flag.
    - [x] Add manual project entry action.
    - [x] Update TDD tests for `projectsStore`.
- [x] Task: Update `systemStore.ts` to respect `showSystemStats` setting and `hasBackend` capability.
    - [x] Update `fetchStats` to conditionally run.
    - [x] Add `openTaskManager` and `checkPort` actions.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Store Migration and Capability Awareness' (Protocol in workflow.md)

## Phase 3: UI Implementation and Platform Adaptation
- [ ] Task: Implement conditional UI in `Dashboard/HomeView.vue`.
    - [ ] Wrap resource widgets in `v-if` based on `showSystemStats` and `hasBackend`.
    - [ ] Replace "Uptime/Platform" with a "System Monitor" button that calls `openTaskManager`.
    - [ ] Implement manual project entry modal/dialog.
- [ ] Task: Fix Port Checker UI in `Dashboard/HomeView.vue`.
    - [ ] Connect the check button to the `systemStore.checkPort` action.
    - [ ] Show a Quasar dialog or notification with the port status (Available/Taken).
- [ ] Task: Update `SettingsView.vue` to include the toggle for system statistics.
- [ ] Task: Implement "Not Supported" tooltips/states for OS actions in SPA mode.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: UI Implementation and Platform Adaptation' (Protocol in workflow.md)

## Phase 4: Final Validation and Multi-Platform Testing
- [ ] Task: Verify SPA mode functionality (`quasar dev`).
- [ ] Task: Verify Electron mode functionality (`quasar dev -m electron`).
- [ ] Task: Verify SSR mode functionality (`quasar dev -m ssr`).
- [ ] Task: Run full regression test suite (Vitest + Cypress).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Validation and Multi-Platform Testing' (Protocol in workflow.md)
