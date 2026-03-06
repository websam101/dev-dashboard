function terminalLog(violations: any) {
  cy.task(
    'log',
    `${violations.length} accessibility violation${
      violations.length === 1 ? '' : 's'
    } ${violations.length === 1 ? 'was' : 'were'} detected`
  );
  // pluck specific keys to keep the table readable
  const violationData = violations.map(
    ({ id, impact, description, nodes }: any) => ({
      id,
      impact,
      description,
      nodes: nodes.length
    })
  );

  cy.task('table', violationData);
}

describe('Accessibility and Contrast Audit', () => {
  beforeEach(() => {
    cy.visit('/');
    // Defensive wait for hydration
    cy.get('.q-layout', { timeout: 10000 }).should('be.visible');
    cy.injectAxe();
  });

  it('checks accessibility in Light Mode', () => {
    // Ensure light mode is set
    cy.get('body').then(($body) => {
      if ($body.hasClass('body--dark')) {
        cy.visit('/settings');
        cy.get('.q-item:contains("Dark Mode")').find('.q-toggle').click();
        cy.visit('/');
        cy.injectAxe();
      }
    });
    
    cy.checkA11y(undefined, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'section508']
      }
    }, terminalLog);
  });

  it('checks accessibility in Dark Mode', () => {
    // Switch to dark mode
    cy.visit('/settings');
    cy.get('body').then(($body) => {
      if (!$body.hasClass('body--dark')) {
        cy.get('.q-item:contains("Dark Mode")').find('.q-toggle').click();
      }
    });
    
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y(undefined, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'section508']
      }
    }, terminalLog);
  });

  it('checks contrast on Bookmarks page', () => {
    cy.visit('/bookmarks');
    cy.get('.bookmark-card').should('exist');
    cy.injectAxe();
    cy.checkA11y(undefined, {
      runOnly: ['color-contrast']
    }, terminalLog);
  });

  it('checks contrast on Projects page', () => {
    cy.visit('/projects');
    cy.get('.project-row').should('exist');
    cy.injectAxe();
    cy.checkA11y(undefined, {
      runOnly: ['color-contrast']
    }, terminalLog);
  });
});
