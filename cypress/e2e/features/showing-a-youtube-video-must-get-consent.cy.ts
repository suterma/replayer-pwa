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

describe('loading a YouTube video for the first time', () => {
    it(`must ask for consent`, () => {
        // ACT (load YouTube video)
        cy.load(`/#/play?media=https://www.youtube.com/watch?v=21X5lGlDOfg`);

        // ASSERT (that the button for consent is shown)
        cy.get('button[data-cy="youtube-consent"]').should(
            'contain.text',
            'YouTube consent required',
        );
    });
});
