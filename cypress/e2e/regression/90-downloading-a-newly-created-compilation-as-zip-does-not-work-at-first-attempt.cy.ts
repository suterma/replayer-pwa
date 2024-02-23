describe('testing the issue "90-downloading-a-newly-created-compilation-as-zip-does-not-work-at-first-attempt" for regression', () => {
    beforeEach(() => {
        cy.loadDemo();
    });

    it('asserts the download', () => {
        // Download the compilation as ZIP
        cy.get('#app [data-cy="dropdown-menu-trigger"]').click();
        cy.get('[data-cy="dropdown-menu-item"]').contains('Download').click();

        // Choose the ZIP type
        cy.get('[data-cy="modal-form"] [data-cy="radio-download-zip"]').click();
        cy.get('[data-cy="modal-form"] [data-cy="submit-button"]').click();

        // ASSERT (the download)
        cy.readFile(
            'cypress/downloads/Demo Compilation (Featuring Lidija Roos).zip',
        );
    });
});
