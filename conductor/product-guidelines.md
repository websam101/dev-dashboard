# Product Guidelines - Dev Dashboard

## Prose & Communication
- **Tone:** Professional, technical, and direct. Avoid fluff or overly conversational language.
- **Terminology:** Use standard developer terminology (e.g., "Repository" instead of "Folder", "Endpoint" instead of "Link").
- **Clarity:** Ensure error messages provide actionable steps for resolution.

## Branding & Visual Identity
- **Theme:** Strict Dark Mode. Use a palette of deep greys, slate, and high-contrast primary accents (Quasar primary color).
- **Typography:** Monospaced fonts for paths, code snippets, and system stats. Clean sans-serif for UI labels.
- **Icons:** Use Material Icons for consistency. Ensure icons are intuitive (e.g., folder for projects, monitor for system stats).

## User Experience (UX) Principles
- **Efficiency:** Minimize the number of clicks required to perform frequent actions (e.g., opening VS Code).
- **Feedback:** Provide immediate visual feedback for all background operations (Git sync, directory scan).
- **Information Density:** Prioritize high-value information. Use tooltips for secondary details to keep the UI clean.
- **Resilience:** The UI must remain responsive during long-running OS tasks. Use skeleton loaders or progress bars.

## Project-Specific Rules
- **No-Hardcoded-Text:** Strictly adhere to i18n for all UI strings.
- **Local-First:** Prioritize IndexedDB for data persistence to ensure offline availability.
- **Security:** Never display or store sensitive credentials (e.g., Git SSH keys) within the UI.
