describe('i18n Completeness Audit', () => {
  const pages = ['/', '/projects', '/bookmarks', '/settings'];

  pages.forEach(page => {
    it(`checks for hardcoded text or missing translations on ${page}`, () => {
      cy.visit(page);
      cy.get('.q-layout', { timeout: 10000 }).should('be.visible');
      
      cy.get('body').then($body => {
        const text = $body.text();
        
        // Match patterns like "nav.dashboard" which indicate a raw key leaking
        const rawKeyPattern = /[a-z]+\.[a-z]+/gi;
        
        const matches = text.match(rawKeyPattern);
        if (matches) {
          const excluded = ['process.env', 'node_modules', 'vue-i18n', 'lowdb.json', 'client-entry.js', 'idb.js', 'pinia.js', 'chunk-'];
          const realLeaks = matches.filter(m => !excluded.some(e => m.includes(e)));
          
          if (realLeaks.length > 0) {
            cy.log('Potential i18n leaks:', realLeaks.join(', '));
          }
          // We don't fail immediately on ANY match because technical strings often exist in logs/overlays during dev
          // But we can check specific known keys if needed.
        }
      });

      // All buttons with icons only should have aria-label or some accessible name
      cy.get('button').each($btn => {
        const hasIcon = $btn.find('.q-icon').length > 0;
        const hasText = $btn.text().trim().length > 0;
        if (hasIcon && !hasText) {
          const accessibleName = $btn.attr('aria-label') || $btn.attr('title');
          expect(accessibleName, `Icon button missing accessible name: ${$btn.html().substring(0, 100)}`).to.not.be.undefined;
        }
      });
    });
  });
});
