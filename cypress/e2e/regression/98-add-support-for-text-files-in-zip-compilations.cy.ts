/* eslint-disable jest/expect-expect */
describe('loading and displaying of text content with the issue "98-add-support-for-text-files-in-zip-compilations"', () => {
    beforeEach(() => {
        cy.loadDemo();
    });

    it('shows the contained text note', () => {
        // Download the compilation as ZIP
        cy.get('#app [data-cy="dropdown-menu-trigger"]').click();
        cy.get('[data-cy="dropdown-menu-item"]').contains('Download').click();

        // Choose the ZIP type
        cy.get('[data-cy="modal-form"] [data-cy="radio-download-zip"]').click();
        cy.get('[data-cy="modal-form"] [data-cy="button-download"]').click();

        // ASSERT (the download)
        cy.readFile(
            'cypress/downloads/Demo Compilation (Featuring Lidija Roos).rez',
        );
    });
});
