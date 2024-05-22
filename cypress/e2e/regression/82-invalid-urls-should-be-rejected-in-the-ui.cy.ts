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

describe('testing the issue "Invalid URLs should be rejected in the UI #82" for regression', () => {
    it('should reject an invalid protocol', () => {
        // ACT
        cy.loadMediaUrl('httpx://example.com');

        // ASSERT
        cy.get('input[data-cy="input-url"]')
            .invoke('prop', 'validationMessage')
            .should((text: string) => {
                expect(text).contains('Please match the requested format.');
            });
    });

    it('should reject a completely invalid URL', () => {
        // ACT
        cy.loadMediaUrl('x//example.com');

        // ASSERT
        cy.get('input[data-cy="input-url"]')
            .invoke('prop', 'validationMessage')
            .should((text: string) => {
                expect(text).contains('Please enter a URL.');
            });
    });

    it('should reject a single word', () => {
        // ACT
        cy.loadMediaUrl('example');

        // ASSERT
        cy.get('input[data-cy="input-url"]')
            .invoke('prop', 'validationMessage')
            .should((text: string) => {
                expect(text).contains('Please enter a URL.');
            });
    });
});
