/* eslint-disable jest/expect-expect */
describe('testing the issue "Loop does not work directly after app start #73" for regression', () => {
    it('should loop for the "loop track" play mode', () => {
        // ARRANGE (set loop track play mode)
        cy.visit(
            '/#/play?media=https://lib.replayer.app/decisions-by-lidija-roos.ogg',
        );
        cy.get('button[data-cy="toggle-playback-mode"]').click();

        // ACT (go to the end and wait for a loop)
        cy.get('button[data-cy="toggle-playback"]').first().click();
        cy.get('input[type=range]')
            .as('range')
            .invoke('val', 181)
            .trigger('change');
        cy.wait(4000);

        // ASSERT (that the loop occurred, and track is still playing)
        cy.get('input[type=range]')
            .invoke('val') // call the val() method to extract the value
            .then((val) => +(val ?? '')) // convert it to a number
            .should('be.lessThan', 5); // also compare it to a number
        cy.get(
            '[data-cy="media-controls-bar"] [data-cy="playback-indicator"]',
        ).should('have.attr', 'title', 'Track is playing');
    });

    it('should loop for the "loop track" play mode even after an app restart', () => {
        // ARRANGE (set loop track play mode)
        cy.visit(
            '/#/play?media=https://lib.replayer.app/decisions-by-lidija-roos.ogg',
        );
        cy.get('button[data-cy="toggle-playback-mode"]').click();

        // ACT restart
        cy.visit('/');

        // ACT (go to the end and wait for a loop)
        cy.get('button[data-cy="toggle-playback"]').first().click();
        cy.get('input[type=range]')
            .as('range')
            .invoke('val', 181)
            .trigger('change');
        cy.wait(4000);

        // ASSERT (that the loop occurred, and track is still playing)
        cy.get('input[type=range]')
            .invoke('val') // call the val() method to extract the value
            .then((val) => +(val ?? '')) // convert it to a number
            .should('be.lessThan', 5); // also compare it to a number
        cy.get(
            '[data-cy="media-controls-bar"] [data-cy="playback-indicator"]',
        ).should('have.attr', 'title', 'Track is playing');
    });

    it('should loop for the "loop cue" play mode', () => {
        // ARRANGE (set cue track play mode)
        cy.visit(
            '/#/play?181=ending-cue&media=https://lib.replayer.app/decisions-by-lidija-roos.ogg',
        );
        cy.get('button[data-cy="toggle-playback-mode"]')
            .click()
            .click()
            .click();

        // ACT (press the ending cue and wait for a loop)
        cy.get('button[title="Play from ending-cue"]').click();
        cy.wait(4000);

        // ASSERT (that the loop occurred)
        cy.get(
            '[data-cy="media-controls-bar"] [data-cy="playback-indicator"]',
        ).should('have.attr', 'title', 'Track is playing');
    });

    it('should loop for the "loop compilation" play mode', () => {
        // ARRANGE (load 2-track compilation and start playback)
        cy.loadFile('cypress/fixtures/2-tracks-with-anechoic-voices.rex');
        cy.get('button[data-cy="toggle-playback"]')
            .eq(1 /*second track*/)
            .click();
        // ARRANGE (set loop compilation play mode)
        cy.get('.button[data-cy="toggle-playback-mode"]')
            .click()
            .click()
            .click()
            .click();

        // ACT (go to the ending and wait for a move to the subsequent track)
        cy.get('input[type=range]')
            .as('range')
            .invoke('val', 2)
            .trigger('change');
        cy.wait(4000);

        // ASSERT (that the first track was selected next)
        cy.get('nav#media-player [data-cy="track-name"]').should(
            'have.text',
            'female',
        );
    });
});
