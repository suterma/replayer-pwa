/* eslint-disable jest/expect-expect */

describe('testing the issue "Invalid Files from an URI (e.g. images) should gracefully fail #83" for regression', () => {
    it('should reject a JPEG image', () => {
        cy.loadMediaUrl(
            'https://marcelsuter.ch/wp-content/uploads/2018/04/cropped-IMG_marcelphone_20180323_100356.jpg',
        );
        cy.get('[data-cy="notification-danger"]').contains(
            'Error while retrieving media source',
        );
    });

    it('should reject a webp image', () => {
        cy.loadMediaUrl(
            'https://replayer.app/user/pages/01.home/02._howitworks/visual-function-web-vertical-en.webp',
        );
        cy.get('[data-cy="notification-danger"]').contains(
            'Error while retrieving media source',
        );
    });

    it('should reject a PDF', () => {
        cy.loadMediaUrl(
            'https://marcelsuter.ch/wp-content/uploads/2018/08/Complete-compilation-public.pdf',
        );
        cy.get('[data-cy="notification-danger"]').contains(
            'Error while retrieving media source',
        );
    });

    it('should reject a Video', () => {
        cy.loadMediaUrl(
            'https://twit.tv/shows/security-now/episodes/901?autostart=false',
        );
        cy.get('[data-cy="notification-danger"]').contains(
            'Error while retrieving media source',
        );
    });
});
