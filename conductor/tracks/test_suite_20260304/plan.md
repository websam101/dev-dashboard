# Implementation Plan - Implement 100% Code Coverage & Robust Test Suite

## Phase 1: Infrastructure & Thresholds
Establish the core testing environment and enforce 100% coverage gates.
- [ ] Task: Configure Vitest Coverage Engine
    - [ ] Install `vitest`, `@vitest/coverage-v8`, and `happy-dom` (for component tests).
    - [ ] Update `vitest.config.ts` to set `coverage` thresholds to 100% for lines, functions, branches, and statements.
    - [ ] Add `test:coverage` script to `package.json`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Thresholds' (Protocol in workflow.md)

## Phase 2: State Management (Pinia Stores)
Achieve 100% coverage for the application's single source of truth.
- [ ] Task: Test `projectsStore.ts`
    - [ ] Write tests for initial state, `loadProjects`, `scanDirectory`, and all Git actions.
    - [ ] Mock `api` (axios) to test success and error responses.
- [ ] Task: Test `bookmarksStore.ts`
    - [ ] Write tests for IndexedDB integration and API synchronization.
    - [ ] Ensure 100% coverage for category filtering logic.
- [ ] Task: Test `systemStore.ts` and `settingsStore.ts`
    - [ ] Verify interval polling logic and reactive state updates.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: State Management (Pinia Stores)' (Protocol in workflow.md)

## Phase 3: Backend Services & API Middlewares
Verify the "OS Bridge" logic with high-fidelity mocking.
- [ ] Task: Test `SystemMonitor.ts`
    - [ ] Mock `node:os` and `systeminformation` to simulate Windows/Linux environments.
    - [ ] Verify timeout handling logic for slow disk scans.
- [ ] Task: Test `ProjectManager.ts` and `ActionExecutor.ts`
    - [ ] Write tests for tech detection, git status parsing, and child process spawning.
- [ ] Task: Test `src-ssr/middlewares/api.ts`
    - [ ] Set up supertest or equivalent to verify Express route handling and body parsing.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Backend Services & API Middlewares' (Protocol in workflow.md)

## Phase 4: UI Components & Final Audit
Ensure the view layer is fully tested and functional.
- [ ] Task: Test `HomeView.vue`, `ProjectsView.vue`, and `BookmarksView.vue`
    - [ ] Use `@vue/test-utils` to verify component rendering and user interaction (clicks, inputs).
- [ ] Task: Final Coverage Sweep
    - [ ] Run full coverage report and eliminate any remaining uncovered branches in `src/`.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: UI Components & Final Audit' (Protocol in workflow.md)
