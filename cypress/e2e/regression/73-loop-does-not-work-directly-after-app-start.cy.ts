/* eslint-disable jest/expect-expect */
describe('testing the issue "Loop does not work directly after app start #73" for regression', () => {
    beforeEach(() => {
        // cy.visit(
        //     '/#/play?181=&media=https://lib.replayer.app/decisions-by-lidija-roos.ogg',
        // );
    });

    it('should loop for the "loop track" play mode', () => {
        // ARRANGE (set loop track play mode)
        cy.visit(
            '/#/play?181=&media=https://lib.replayer.app/decisions-by-lidija-roos.ogg',
        );      cy.get('button[data-cy="toggle-playback-mode"]').click();

        // ACT (press the ending cue and wait for a look)
        cy.get('.track .button.cue').click();
        cy.wait(4000);

        // ASSERT (that the loop occurred)
        cy.get(
            '[data-cy="media-controls-bar"] [data-cy="playback-indicator"]',
        ).should('have.attr', 'title', 'Track is playing');
    });

    it('should loop for the "loop cue" play mode', () => {
        // ARRANGE (set cue track play mode)
        cy.visit(
            '/#/play?181=&media=https://lib.replayer.app/decisions-by-lidija-roos.ogg',
        );      cy.get('button[data-cy="toggle-playback-mode"]')
            .click()
            .click()
            .click();

        // ACT (press the ending cue and wait for a look)
        cy.get('.track .button.cue').click();
        cy.wait(4000);

        // ASSERT (that the loop occurred)
        cy.get(
            '[data-cy="media-controls-bar"] [data-cy="playback-indicator"]',
        ).should('have.attr', 'title', 'Track is playing');
    });

    it('should loop for the "loop compilation" play mode', () => {
        // ARRANGE (set cue track play mode)
        cy.visit(
            '/#/play?package=https://lib.replayer.app/Test-Compilation%20featuring%20Lidija%20Roos%20%28WAV%20files%20in%20various%20sizes%29.rez',
        );
        cy.get('button[data-cy="toggle-playback-mode"]')
            .click()
            .click()
            .click()
            .click()
            .click();

        // ACT (press the ending cue and wait for a look)
        cy.get('.track .button.cue').click();
        cy.wait(4000);

        // ASSERT (that the loop occurred)
        cy.get(
            '[data-cy="media-controls-bar"] [data-cy="playback-indicator"]',
        ).should('have.attr', 'title', 'Track is playing');
    });
});
