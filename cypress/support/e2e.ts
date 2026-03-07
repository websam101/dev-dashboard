// Import cypress-axe to enable a11y testing commands
import 'cypress-axe';

// Import custom commands
import './commands';

// Custom violation logger for console
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

(Cypress as any).terminalLog = terminalLog;

// Ignore ResizeObserver loop limit exceeded error (common in Vue/Quasar testing)
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop completed with undelivered notifications') || 
      err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});
