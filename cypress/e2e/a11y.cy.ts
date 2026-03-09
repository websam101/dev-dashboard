/**
 * Copyright (C) 2025-2026 Sam <websam101@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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
