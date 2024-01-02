describe('loading a YouTube video for the first time', () => {
    it(`must ask for consent`, () => {
        // ACT (load YouTube video)
        cy.load(`/#/play?media=https://www.youtube.com/watch?v=21X5lGlDOfg`);

        // ASSERT (that the modal for consent is shown)
        cy.get('[data-cy="youtube-consent"] .modal.is-active').should(
            'contain.text',
            'You are about to load content from YouTube, a service from Google.',
        );
    });
});
