describe('interacting with the demo', () => {
    beforeEach(() => {
        cy.loadDemo();
    });

    it('loads the demo compilation', () => {
        // ASSERT
        cy.get('[data-cy="compilation-title"]').should(
            'have.text',
            'Demo Compilation (Featuring Lidija Roos)',
        );
    });

    it('loads the track', () => {
        // ASSERT
        cy.get('[data-cy="track"] [data-cy="track-name"]').should(
            'have.text',
            'Not for Sale',
        );
    });

    it('loads the cues', () => {
        // ASSERT
        cy.get('[data-cy="cue-button"]').should('have.length', 10);
        cy.get('.cue span.has-text-weight-semibold.foreground').should(
            'have.text',
            'Intro (with Guitar Solo)Verse 1Refrain "Not for Sale"BridgeVerse 2Refrain "Not for Sale"Rap PartBridge (Guitar Solo)Refrain "Not for Sale" soft styleOutroCue',
        );
    });

    it('loads the media file', () => {
        // ASSERT
        cy.get('.track button.button.is-nav.is-indicator').should(
            'have.attr',
            'title',
            'Track is loaded and ready to play',
        );
    });

    it('plays the media file', () => {
        // ACT
        cy.get('.track button.is-success').click();

        // ASSERT
        cy.get('.track button.button.is-nav.is-indicator').should(
            'have.attr',
            'title',
            'Track is playing',
        );
    });
});
