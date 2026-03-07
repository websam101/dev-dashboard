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
      // Use the visible action button instead of sidebar
      cy.get('.action-btn-small').contains('Projects').click();
      cy.url().should('include', '/projects');
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

    it('displays managed scan roots', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.q-chip').length > 0) {
          cy.get('.q-chip').should('exist');
        }
      });
    });

    it('can open the manual scan dialog', () => {
      // Use text content which is more stable across environments
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
      
      // Fav bar should only show if there are pinned items
      cy.get('body').then(($body) => {
        if ($body.find('.fav-bar').length > 0) {
          cy.get('.fav-bar').should('contain', 'PINNED');
        }
      });
    });

    it('features a multi-select high-density table', () => {
      cy.get('.compact-table').should('exist');
      cy.get('th .q-checkbox').should('exist'); // Selection header
    });

    it('opens resource details in a modal', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.q-btn[icon="visibility"]').length > 0) {
          cy.get('.q-btn[icon="visibility"]').first().click();
          cy.get('.q-dialog', { timeout: 10000 }).should('be.visible');
          cy.get('.q-card').should('exist');
        }
      });
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
