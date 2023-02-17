/* eslint-disable jest/expect-expect */
describe('interacting with the demo', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8080/');
        cy.contains('Try the demo').click();
        cy.url().should('include', '#/play');
    });

    it('loads the demo compilation', () => {
        // ASSERT
        cy.get('.compilation .title.is-3').should(
            'have.text',
            'Demo Compilation (Featuring Lidija Roos)',
        );
    });

    it('loads the track', () => {
        // ASSERT
        cy.get('.track .title.is-4').should('have.text', 'Not for Sale');
    });

    it('loads the cues', () => {
        // ASSERT
        cy.get('.cue span.has-text-weight-semibold.foreground').should('have.text', 'Intro (with Guitar Solo)Verse 1BridgeRefrain "Not for Sale"Bridge 2Verse 2Refrain "Not for Sale"Rap PartBridge (Guitar Solo)Refrain "Not for Sale" soft styleOutro');
    });

    it('loads the media file', () => {
        // ASSERT
        cy.get('.track button.button.is-nav.is-indicator').should('have.attr', 'title', 'Track is loaded and ready to play')
    });

    it('plays the media file', () => {
        // ACT
        cy.get('.track button.is-success').click();

        // ASSERT
        cy.get('.track button.button.is-nav.is-indicator').should('have.attr', 'title', 'Track is playing')
    });
});
