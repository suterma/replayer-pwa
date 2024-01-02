import { mediaSourceUrls } from './../../fixtures/all-types-of-media-urls';

mediaSourceUrls.forEach((mediaSourceUrl) => {
    describe('the cue update button', () => {
        it(`must set the position according the current playback position (using an ${mediaSourceUrl.name} source)`, () => {
            const cuePosition = 10;
            // ARRANGE (create a cue at the beginning)
            cy.load(`/#/edit?media=${mediaSourceUrl.url}`);
            cy.consentIfYouTube(mediaSourceUrl.url);

            cy.get('button[data-cy="insert-cue"]').first().click();

            // ACT (go to the middle of the track)
            cy.get('button[data-cy="toggle-playback"]').first().click();
            cy.get('input[type=range]')
                .as('range')
                .invoke('val', 10)
                .trigger('change');

            // ACT (allow the seek operation to execute, then should be at least the desired seek position)
            cy.get('[data-cy="current-time"]').contains('00:10.');

            // ACT (update cue)
            cy.get('[data-cy="cue-editors"] button[data-cy="adjust-time"]')
                .first()
                .click();

            // ASSERT (that the cue was updated.)
            cy.get(
                '[data-cy="cue-editors"] input[type=number][data-cy="input-time-position"]',
            )
                .invoke('val') // call the val() method to extract the value
                .then((val) => +(val ?? '')) // convert it to a number
                .should('be.least', 10); // also compare it to a number
            //Because it starts to play, it will eventually be greater than the set value}
        });
    });
});
