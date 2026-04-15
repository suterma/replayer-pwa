describe('testing the issue "69-the-demo-is-not-loading-from-an-external-link" for regression', () => {
    it('should load the demo as from the website', () => {
        // ACT
        cy.load('/#/demo');

        // ASSERT that the demo is loaded
        cy.get('.compilation span.title.is-3').contains(
            'Demo Compilation (Featuring Lidija Roos)',
        );
    });
});
