import { mediaSourceUrls } from './../../fixtures/all-invalid-file-urls';

mediaSourceUrls.forEach((mediaSourceUrl) => {
    describe('testing the issue "Invalid Files from an URI (e.g. images) should gracefully fail #83" for regression', () => {
        it(`should reject a ${mediaSourceUrl.name}`, () => {
            cy.loadMediaUrl(mediaSourceUrl.url);
            cy.get('[data-cy="notification-danger"]').contains('Not supported');
            cy.get('[data-cy="notification-danger"]').contains(
                'Please select another media resource. See the documentation for supported media types.',
            );
        });
    });
});
