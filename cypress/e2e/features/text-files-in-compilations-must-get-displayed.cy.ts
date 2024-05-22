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

describe('text files in packages (zip-compilations)', () => {
    it('must get displayed', () => {
        // ARRANGE
        cy.loadDemo();

        // ACT

        // ASSERT (that the text was displayed)
        cy.get('.tracks .track[data-cy="notice-track"]')
            .first()
            .should(
                'contain',
                'Click a button to play the track from that time position or use the controls at the bottom.',
            );
    });
});
