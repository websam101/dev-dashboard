# Implementation Plan: Port Ownership Warning

## Phase 1: Logic and Store Integration [checkpoint: bd49ae1]
- [x] Task: Implement `checkPortOwnership` action in `systemStore.ts`.
    - [x] Action should take a `port: number` and return the project name if found in `projectsStore`.
- [x] Task: Write unit tests for `systemStore.checkPortOwnership`.
    - [x] Test case: Port owned by a project (via `ports`).
    - [x] Test case: Port owned by a project (via `managedPorts`).
    - [x] Test case: Port not owned.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Logic and Store Integration' (Protocol in workflow.md)

## Phase 2: UI Integration and Feedback
- [ ] Task: Update `checkRadar` in `ProjectsView.vue` to include ownership check.
    - [ ] Call `systemStore.checkPortOwnership` before or after the physical check.
    - [ ] Display a warning notification if a project name is returned.
- [ ] Task: Update i18n files with the new warning message.
    - [ ] Add `projects.portOwnedWarning` to `en-US` and `fr` files.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Integration and Feedback' (Protocol in workflow.md)
