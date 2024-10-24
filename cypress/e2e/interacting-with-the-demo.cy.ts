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

describe('interacting with the demo', () => {
    beforeEach(() => {
        cy.loadDemo();
    });

    it('loads the demo compilation', () => {
        // ASSERT
        cy.get('[data-cy="compilation-title"]').should(
            'have.text',
            'Demo Compilation (Featuring Lidija Roos)',
        );
    });

    it('loads the track', () => {
        // ASSERT
        cy.get('[data-cy="track"] [data-cy="track-name"]').should(
            'have.text',
            'Not for Sale',
        );
    });

    it('loads the cues', () => {
        // ASSERT
        cy.get('[data-cy="cue-button"]').should('have.length', 10);
        cy.get('.cue span.has-text-weight-semibold.foreground').should(
            'have.text',
            'Intro (with Guitar Solo)Verse 1Refrain "Not for Sale"BridgeVerse 2Refrain "Not for Sale"Rap PartBridge (Guitar Solo)Refrain "Not for Sale" soft styleOutroCue',
        );
    });

    it('loads the media file', () => {
        // ASSERT
        cy.get('.track [data-cy="playback-indicator"]').should(
            'have.attr',
            'data-tooltip',
            'Track is paused',
        );
    });

    it('plays the media file', () => {
        // ACT
        cy.get('.track button.is-success').click();

        // ASSERT
        cy.get('.track [data-cy="playback-indicator"]').should(
            'have.attr',
            'data-tooltip',
            'Track is playing',
        );
    });
});
