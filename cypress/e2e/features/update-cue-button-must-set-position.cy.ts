/* eslint-disable jest/expect-expect */
describe('the cue update button', () => {
    it('must set the position according the current playback position (using an audio source)', () => {
        checkCueUpdateFor(
            'https://lib.replayer.app/decisions-by-lidija-roos.ogg',
        );
    });

    it('must set the position according the current playback position (using a video source)', () => {
        checkCueUpdateFor(
            'https://lib.replayer.app/nasa-4k/2023_Moon_Phase_North_Up_YouTubeHD.webm',
        );
    });

    it('must set the position according the current playback position (using a YouTube source)', () => {
        checkCueUpdateFor('https://www.youtube.com/watch?v=7XzhtWcepos');
    });

    function checkCueUpdateFor(mediaSourceUrl: string): void {
        // ARRANGE (crete a cue at the beginning)
        cy.visit(`/#/edit?media=${mediaSourceUrl}`);
        cy.get('button[data-cy="insert-cue"]').first().click();

        // ACT (go to the middle of the track)
        cy.get('button[data-cy="toggle-playback"]').first().click();
        cy.get('input[type=range]')
            .as('range')
            .invoke('val', 50)
            .trigger('change');

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
            .should('be.least', 50); // also compare it to a number
        //Because it starts to play, it will eventually be greater than the set value}
    }
});
