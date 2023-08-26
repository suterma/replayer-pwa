import { mediaSourceUrls } from './../../fixtures/all-types-of-media-urls';

mediaSourceUrls.forEach((mediaSourceUrl) => {
    describe('testing the issue "Loop does not work directly after app start #73" for regression', () => {
        it(`should loop for the "loop track" play mode (using an  ${mediaSourceUrl.name} source)`, () => {
            // ARRANGE (set loop track play mode)
            cy.visit(`/#/play?media=${mediaSourceUrl.url}`);
            cy.get('button[data-cy="toggle-playback-mode"]').click();

            // ACT (go to the end and wait for a loop)
            cy.get('button[data-cy="toggle-playback"]').first().click();
            cy.get('input[type=range]')
                .as('range')
                .invoke('val', mediaSourceUrl.duration - 2.0)
                .trigger('change');

            //Wait potentially slow loading of media
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

        it(`should loop for the "loop track" play mode even after an app restart (using an  ${mediaSourceUrl.name} source)`, () => {
            // ARRANGE (set loop track play mode)
            cy.visit(`/#/play?media=${mediaSourceUrl.url}`);
            cy.get('button[data-cy="toggle-playback-mode"]').click();

            // ACT restart
            cy.visit('/');

            // ACT (go to the end and wait for a loop)
            cy.get('button[data-cy="toggle-playback"]').first().click();
            cy.get('input[type=range]')
                .as('range')
                .invoke('val', mediaSourceUrl.duration - 2.0)
                .trigger('change');

            //Wait potentially slow loading of media
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

        it(`should loop for the "loop cue" play mode (using an  ${mediaSourceUrl.name} source)`, () => {
            // ARRANGE (set cue track play mode)
            cy.visit(
                `/#/play?${mediaSourceUrl.duration - 2.0}=ending-cue&media=${
                    mediaSourceUrl.url
                }`,
            );
            cy.get('button[data-cy="toggle-playback-mode"]')
                .click()
                .click()
                .click();

            // ACT (press the ending cue and wait for a loop)
            cy.get('button[title="Play from ending-cue"]').click();

            //Wait potentially slow loading of media
            cy.wait(4000);

            // ASSERT (that the loop occurred)
            cy.get(
                '[data-cy="media-controls-bar"] [data-cy="playback-indicator"]',
            ).should('have.attr', 'title', 'Track is playing');
        });
    });
});

describe('testing the issue "Loop does not work directly after app start #73", for the complilation loop mode, with audio', () => {
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

        //Wait potentially slow loading of media
        cy.wait(4000);

        // ASSERT (that the first track was selected next)
        cy.get('nav#media-player [data-cy="track-name"]').should(
            'have.text',
            'female',
        );
    });
});
