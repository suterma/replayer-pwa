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

describe('testing the issue "Loading a media file or media URL should redirect to edit mode automatically #80" for regression', () => {
    it('should go to edit mode after media load (with CORS Header)', () => {
        // ACT
        cy.loadMediaUrl(
            'https://lib.replayer.app/demo/your-light-by-lidija-roos.mp3',
        );

        // ASSERT
        cy.hash().should('eq', '#/edit', { matchCase: false });
    });
    it('should go to edit mode after media load (without CORS Header)', () => {
        // ACT
        cy.loadMediaUrl(
            'https://replayer.app/user/pages/06.blog/what-is-the-best-audio-format-for-music-playback/8%20-%20Truth-45-85k-VBR.mp3',
        );

        // ASSERT
        cy.hash().should('eq', '#/edit', { matchCase: false });
    });
});
