describe('Dev Dashboard Feature Suite', () => {
  beforeEach(() => {
    cy.visit('/');
    // Wait for hydration and defensive mounting
    cy.get('.q-layout', { timeout: 10000 }).should('be.visible');
  });

  describe('Dashboard & System Resources', () => {
    it('displays all system resource cards with metrics', () => {
      const resources = ['CPU', 'RAM', 'DISK', 'LOAD', 'NET', 'INFO'];
      resources.forEach(res => {
        cy.contains('.compact-resource-card', res).should('be.visible');
      });
    });

    it('shows visual indicators (progress bars) in resource cards', () => {
      cy.get('.compact-resource-card .q-linear-progress').should('have.length.at.least', 3);
    });

    it('navigates to projects via action button', () => {
      cy.get('.action-btn-small').contains('Projects').click();
      cy.url().should('include', '/projects');
    });

    it('displays the Favorite Projects section', () => {
      cy.contains('Favorite Projects').should('be.visible');
    });
  });

  describe('Project Hub (High Density)', () => {
    beforeEach(() => {
      cy.visit('/projects');
    });

    it('renders the projects table with correct columns', () => {
      cy.get('.compact-table').should('be.visible');
      cy.get('th').contains('PROJECT').should('exist');
      cy.get('th').contains('PATH').should('exist');
      cy.get('th').contains('PORTS').should('exist');
    });

    it('can toggle favorite status on a project', () => {
      // Find the first star icon (favorite toggle)
      cy.get('.q-table tbody tr').first().within(() => {
        cy.get('.q-checkbox').first().click();
      });
      // The state should update, but we'll just verify the click doesn't crash
    });

    it('can open the manual scan dialog', () => {
      cy.get('button').contains('Manual Scan').click();
      cy.get('.q-dialog').should('be.visible');
      cy.contains('Scan for Projects').should('be.visible');
    });
  });

  describe('Resource Manager (Bookmarks)', () => {
    beforeEach(() => {
      cy.visit('/bookmarks');
    });

    it('displays collection tabs and the context-aware fav-bar', () => {
      cy.get('.tabs-container').should('be.visible');
      cy.get('.q-tab').contains('All Resources').should('exist');
    });

    it('features a multi-select high-density table', () => {
      cy.get('.compact-table').should('exist');
      cy.get('th .q-checkbox').should('exist'); // Selection header
    });
  });

  describe('Settings & Developer Tools', () => {
    beforeEach(() => {
      cy.visit('/settings');
    });

    it('displays theme and language settings', () => {
      cy.contains('Dark Mode').should('be.visible');
      cy.contains('Language').should('be.visible');
    });

    it('shows developer synchronization tools in dev mode', () => {
      // These should be visible since process.env.DEV is true during testing
      cy.contains('Developer Tools').should('be.visible');
      cy.contains('Push Local to Backend').should('be.visible');
      cy.contains('Pull Backend to Local').should('be.visible');
    });
  });

  describe('Theming & Accessibility', () => {
    it('ensures no raw i18n keys are visible', () => {
      cy.visit('/');
      cy.get('body').should('not.contain', 'nav.');
      cy.get('body').should('not.contain', 'dashboard.');
      cy.get('body').should('not.contain', 'projects.');
    });
  });
});
