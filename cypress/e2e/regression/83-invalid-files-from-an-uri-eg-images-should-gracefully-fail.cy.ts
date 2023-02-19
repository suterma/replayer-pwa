/* eslint-disable jest/expect-expect */

describe('testing the issue "Invalid Files from an URI (e.g. images) should gracefully fail #83" for regression', () => {
    beforeEach(() => {
        cy.loadEmpty();
    });

    afterEach(() => {
        cy.get('[cy-data="notification-danger"]').contains(
            'Error while retrieving media source',
        );
    });

    /** Loads the given media url using the application's dedicated input field */
    function loadMediaUrl(mediaUrl: string) {
        cy.get('input[type="url"]')
            .type(mediaUrl)
            .get('button[type="submit"]')
            .click();
    }

    it('should reject a JPEG image', () => {
        loadMediaUrl(
            'https://marcelsuter.ch/wp-content/uploads/2018/04/cropped-IMG_marcelphone_20180323_100356.jpg',
        );
    });

    it('should reject a webp image', () => {
        loadMediaUrl(
            'https://replayer.app/user/pages/01.home/02._howitworks/visual-function-web-vertical-en.webp',
        );
    });

    it('should reject a PDF', () => {
        loadMediaUrl(
            'https://marcelsuter.ch/wp-content/uploads/2018/08/Complete-compilation-public.pdf',
        );
    });

    it('should reject a Video', () => {
        loadMediaUrl(
            'https://twit.tv/shows/security-now/episodes/901?autostart=false',
        );
    });
});
