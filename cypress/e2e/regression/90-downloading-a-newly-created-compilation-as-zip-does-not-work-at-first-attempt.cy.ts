/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

describe('testing the issue "90-downloading-a-newly-created-compilation-as-zip-does-not-work-at-first-attempt" for regression', () => {
    beforeEach(() => {
        cy.loadDemo();
    });

    it('asserts the download', () => {
        // Download the compilation as ZIP
        cy.get(
            '#app [data-cy="context-menu-app"] [data-cy="dropdown-menu-trigger"]',
        ).click();
        cy.get('[data-cy="dropdown-menu-button"]').contains('Download').click();

        // Choose the ZIP type
        cy.get('[data-cy="modal-form"] [data-cy="radio-download-zip"]').click();
        cy.get('[data-cy="modal-form"] [data-cy="submit-button"]').click();

        // ASSERT (the download)
        cy.readFile(
            'cypress/downloads/demo-compilation-featuring-lidija-roos.zip',
        );
    });
});
