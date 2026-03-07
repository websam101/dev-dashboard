describe('Accessibility and Contrast Audit', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('.q-layout', { timeout: 10000 }).should('be.visible');
    cy.injectAxe();
  });

  it('checks accessibility in Light Mode', () => {
    cy.checkA11y(undefined, {
      rules: {
        'region': { enabled: false }
      }
    }, (Cypress as any).terminalLog);
  });

  it('checks accessibility in Dark Mode', () => {
    cy.visit('/settings');
    cy.get('body').then(($body) => {
      if (!$body.hasClass('body--dark')) {
        // Toggle dark mode - targeting the first label which is Dark Mode
        cy.contains('Dark Mode').closest('.q-item').find('.q-toggle').click();
        cy.get('body').should('have.class', 'body--dark');
      }
    });
    cy.visit('/');
    cy.get('body', { timeout: 5000 }).should('have.class', 'body--dark');
    cy.injectAxe();
    cy.checkA11y(undefined, {
      rules: {
        'region': { enabled: false }
      }
    }, (Cypress as any).terminalLog);
  });

  it('checks contrast on Bookmarks page', () => {
    cy.visit('/bookmarks');
    cy.injectAxe();
    // Wait for data to load
    cy.get('.compact-table', { timeout: 5000 }).should('be.visible');
    cy.checkA11y('.compact-table', {
      runOnly: {
        type: 'tag',
        values: ['wcag2aa']
      }
    }, (Cypress as any).terminalLog);
  });

  it('checks contrast on Projects page', () => {
    cy.visit('/projects');
    cy.injectAxe();
    // Wait for table to be visible
    cy.get('.compact-table', { timeout: 5000 }).should('be.visible');
    cy.checkA11y('.compact-table', {
      runOnly: {
        type: 'tag',
        values: ['wcag2aa']
      }
    }, (Cypress as any).terminalLog);
  });
});
