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

describe('invoking cue mnemonic', () => {
    it('should select the track', () => {
        cy.loadFile('cypress/fixtures/2-tracks-with-anechoic-voices.rex');
        cy.contains('2 tracks with anechoic voices');
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000); /* to have the tracks loaded*/

        // ACT (invoke the mnemonic)
        cy.get('body').type('3');
        cy.get('body').type('{enter}');

        // ASSERT that the expected track is selected
        cy.get(
            '[data-cy="track"].is-active-track [data-cy="track-name"]',
        ).contains('male');
    });
    it('should select the track and seek to the cue position', () => {
        cy.loadFile('cypress/fixtures/2-tracks-with-anechoic-voices.rex');
        cy.contains('2 tracks with anechoic voices');
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000); /* to have the tracks loaded*/

        // ACT (invoke the mnemonic)
        cy.get('body').type('6');
        cy.get('body').type('{enter}');

        // ASSERT that the expected track is selected
        cy.get(
            '[data-cy="track"].is-active-track [data-cy="track-name"]',
        ).contains('female');

        // ASSERT that the position is at the expectec cue
        cy.get('[data-cy="current-time"]').contains('00:02.0');
    });
});
