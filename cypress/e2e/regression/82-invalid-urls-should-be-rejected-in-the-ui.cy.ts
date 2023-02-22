/* eslint-disable jest/expect-expect */

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
