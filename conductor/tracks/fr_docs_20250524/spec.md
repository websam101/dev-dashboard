# Specification: Comprehensive French Application Documentation

## Overview
This track aims to create a complete, localized version of all application documentation in French. Following the structure established for the English documentation, this will involve creating a mirror of the `docs/` content within a dedicated `docs/fr/` directory, as well as a localized root `README.fr.md`.

## Functional Requirements
1. **Localized Root (`README.fr.md`):**
   - Translate the main overview, feature list, and technical stack.
   - Link to the French versions of the developer and user guides.
2. **French Developer Guide (`docs/fr/dev/README.md`):**
   - Translate setup instructions, workflow details, and build commands.
3. **French User Guide (`docs/fr/user/README.md` and sub-docs):**
   - Localize the full user manual, including feature walkthroughs for Projects, Bookmarks, and System Monitoring.
   - Mirror the `projects.md` and `bookmarks.md` structure in French.
4. **French Technical Reference (`docs/fr/api/` or mirrors):**
   - Translate the architectural overview, API endpoint references, and data schema.
5. **French Execution Modes (`docs/fr/modes/README.md`):**
   - Localize the comparative table and mode-specific guides.

## Non-Functional Requirements
- **Linguistic Quality:** Use natural, professional, and technically accurate French (e.g., using terms like "Centre de Commandement", "Dépôts Git", "Vérification des Ports").
- **Synchronization:** Ensure all links between French documents are correctly localized to point to other `.md` files within the `docs/fr/` structure.

## Acceptance Criteria
- [ ] `README.fr.md` exists in the root and accurately reflects the project.
- [ ] `docs/fr/dev/README.md` provides a complete localized developer setup.
- [ ] `docs/fr/user/` contains a full localized user manual.
- [ ] `docs/fr/modes/README.md` explains execution modes in French.
- [ ] Technical architecture diagrams (Mermaid) are preserved in the localized docs.

## Out of Scope
- Modifying the application code (i18n keys are already implemented).
- Translating git commit messages or comments in the source code.
