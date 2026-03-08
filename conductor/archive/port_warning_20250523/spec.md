# Specification: Port Ownership Warning in Port Radar

## Overview
This track introduces an enhancement to the Port Radar feature. While the current system checks if a port is physically listening on the OS, it doesn't warn the user if a port is already "managed" or "reserved" by another project in the Dev Dashboard's internal database. This feature will provide a proactive warning (toast notification) if a user checks a port that is already associated with an existing project.

## Functional Requirements
1. **Ownership Detection:**
   - When a port check is triggered in the Port Radar, the system must search through all projects in the `projectsStore`.
   - A port is considered "Reserved" if it exists in either the `ports` (physically detected) or `managedPorts` (manually reserved) array of any project.
2. **Proactive Toast Notification:**
   - If a port is found to be reserved by a project, a Quasar notification (toast) must be displayed.
   - The notification should include the project's name (e.g., "Warning: Port 8080 is managed by Project [Name]").
   - This warning should appear regardless of whether the port is currently physically "BUSY" or "FREE" on the host machine.
3. **Efficient Lookup:**
   - Use a "Full Scan" of the in-memory `projects` array in Pinia for the check. Since the number of projects is typically low (dozens or hundreds), a simple `find` operation is the most efficient and least complex implementation.

## Non-Functional Requirements
- **Performance:** The ownership check must be near-instant and not block the physical port check.
- **Maintainability:** Logic for ownership checking should be encapsulated within the `systemStore` or a shared utility to keep the UI clean.

## Acceptance Criteria
- [ ] Searching for a port in the Radar that is already assigned to a project triggers a warning toast.
- [ ] The toast correctly identifies the name of the owning project.
- [ ] The warning appears even if the port is physically "FREE" (not currently listening).
- [ ] If the port is not assigned to any project, no ownership warning is shown (only the standard "FREE/BUSY" notification).

## Out of Scope
- Global port reservation index (unless performance becomes an issue later).
- Preventing assignment of used ports (this is just a warning).
