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
        cy.get('.q-toggle').first().click();
      }
    });
    cy.visit('/');
    cy.get('body').should('have.class', 'body--dark');
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
    cy.get('.compact-table tr').should('have.length.at.least', 1);
    cy.checkA11y('.compact-table', {
      rules: {
        'color-contrast': { enabled: true }
      }
    }, (Cypress as any).terminalLog);
  });

  it('checks contrast on Projects page', () => {
    cy.visit('/projects');
    cy.injectAxe();
    cy.get('.compact-table tr').should('have.length.at.least', 1);
    cy.checkA11y('.compact-table', {
      rules: {
        'color-contrast': { enabled: true }
      }
    }, (Cypress as any).terminalLog);
  });
});
