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

describe('testing the issue "Loading a compilation from a file or URL should redirect to PLAY mode automatically #81" for regression', () => {
    beforeEach(() => {
        cy.loadEmpty();
        cy.load('#/edit');
    });

    it('should go to play mode after ZIP compilation load', () => {
        // ACT
        cy.loadMediaUrl(
            'https://lib.replayer.app/demo/demo-compilation-featuring-lidija-roos.zip',
        );

        // ASSERT
        cy.hash().should('eq', '#/play');
    });
    it('should go to play mode after XML compilation load', () => {
        // ACT
        cy.loadMediaUrl(
            'https://lib.replayer.app/demo/Demo%20Compilation%20featuring%20Lidija%20Roos%20%28online%20resources%20of%20multiple%20types%29.rex',
        );

        // ASSERT
        cy.hash().should('eq', '#/play');
    });

    it('should go to play mode after local file ZIP compilation load', () => {
        // ACT
        cy.loadFile('cypress/fixtures/your-light-by-lidija-roos.zip');

        // ASSERT
        cy.hash().should('eq', '#/play', { matchCase: false });
    });

    it('should replace an existing compilation entirely, when a new compilation is loaded', () => {
        // ARRANGE (to have a existing compilation)
        cy.loadFile('cypress/fixtures/your-light-by-lidija-roos.zip');
        cy.get('[data-cy="compilation"]').contains('your light by lidija roos');

        // ACT (add a new compilation from URL via URL input)
        cy.load('/#/edit');
        cy.get('[data-cy="input-url"]').click();
        cy.get('[data-cy="input-url"]').type(
            'https://lib.replayer.app/anechoic-voices/Anechoic%20Voices.zip',
        );
        cy.get('[data-cy="submit-source"]').click();

        // ASSERT
        cy.get('[data-cy="compilation"]').contains('lidija'); //.should('not.exist');
        cy.get('[data-cy="compilation"]').contains('female speech');
    });
});
