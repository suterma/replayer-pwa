/* eslint-disable jest/expect-expect */

describe('testing the issue "Invalid URLs should be rejected in the UI #82" for regression', () => {
    beforeEach(() => {
        cy.loadEmpty();
    });

    /** Loads the given media url using the application's dedicated input field */
    function loadMediaUrl(mediaUrl: string) {
        cy.get('input[cy-data="input-media-url"]')
            .type(mediaUrl)
            .get('button[type="submit"]')
            .click();
    }

    it('should reject an invalid protocol', () => {
        // ACT
        loadMediaUrl('httpx://example.com');

        // ASSERT
        cy.get('input[cy-data="input-media-url"]')
            .invoke('prop', 'validationMessage')
            .should((text: string) => {
                expect(text).contains('Please match the requested format.');
            });
    });

    it('should reject a completely invalid URL', () => {
        // ACT
        loadMediaUrl('x//example.com');

        // ASSERT
        cy.get('input[cy-data="input-media-url"]')
            .invoke('prop', 'validationMessage')
            .should((text: string) => {
                expect(text).contains('Please enter a URL.');
            });
    });

    it('should reject a single word', () => {
        // ACT
        loadMediaUrl('example');

        // ASSERT
        cy.get('input[cy-data="input-media-url"]')
            .invoke('prop', 'validationMessage')
            .should((text: string) => {
                expect(text).contains('Please enter a URL.');
            });
    });
});
