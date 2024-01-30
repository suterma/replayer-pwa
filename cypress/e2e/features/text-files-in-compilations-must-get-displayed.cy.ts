describe('text files in packages (zip-compilations)', () => {
    it('must get displayed', () => {
        // ARRANGE
        cy.loadDemo();

        // ACT

        // ASSERT (that the text was displayed)
        cy.get('.tracks .track[data-cy="notice-track"]')
            .first()
            .should(
                'contain',
                'Click a button to play the track from that time position or use the controls at the bottom.',
            );
    });
});
