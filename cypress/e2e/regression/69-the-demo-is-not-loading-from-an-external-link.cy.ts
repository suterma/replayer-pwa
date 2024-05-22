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
