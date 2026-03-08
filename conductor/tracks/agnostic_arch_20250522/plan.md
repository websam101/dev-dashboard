# Implementation Plan: Agnostic Architecture and Universal Storage

## Phase 1: Storage and API Abstraction (The "Agnostic" Core)
- [ ] Task: Create a `StorageAdapter` interface and an `AgnosticDataService` to abstract DB operations from Pinia stores.
    - [ ] Define `StorageAdapter` interface (`src/services/db/types.ts`).
    - [ ] Refactor `IndexedDbAdapter.ts` to implement this interface.
    - [ ] Create `AgnosticDataService.ts` to orchestrate between local adapter and optional backend sync.
- [ ] Task: Update `boot/api.ts` to include platform capability detection.
    - [ ] Add `hasBackend` and `hasFileSystem` flags based on `process.env.MODE` and runtime checks.
- [ ] Task: Implement backend API for opening the system task manager.
    - [ ] Add `openTaskManager()` to `ActionExecutor.ts` (OS-specific commands).
    - [ ] Expose `/api/actions/open-task-manager` in SSR/Electron middlewares.
- [ ] Task: Implement backend API for port checking.
    - [ ] Add `checkPort(port: number)` to `SystemMonitor.ts`.
    - [ ] Expose `/api/utils/check-port` in SSR/Electron middlewares.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Storage and API Abstraction' (Protocol in workflow.md)

## Phase 2: Store Migration and Capability Awareness
- [ ] Task: Refactor `settingsStore.ts` to use `AgnosticDataService` and include `showSystemStats` setting.
    - [ ] Add `showSystemStats` to `Settings` interface.
    - [ ] Update TDD tests for `settingsStore`.
- [ ] Task: Refactor `projectsStore.ts` to use `AgnosticDataService` and honor platform capabilities.
    - [ ] Update `loadProjects` and `syncAll` to respect `hasBackend` flag.
    - [ ] Add manual project entry action.
    - [ ] Update TDD tests for `projectsStore`.
- [ ] Task: Update `systemStore.ts` to respect `showSystemStats` setting and `hasBackend` capability.
    - [ ] Update `fetchStats` to conditionally run.
    - [ ] Add `openTaskManager` and `checkPort` actions.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Store Migration and Capability Awareness' (Protocol in workflow.md)

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
