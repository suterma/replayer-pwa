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
