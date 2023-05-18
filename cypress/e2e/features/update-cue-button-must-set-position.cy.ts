/* eslint-disable jest/expect-expect */
describe('the cue update button', () => {
    it('must set the position according the current playback position', () => {
        // ARRANGE (crete a cue at the beginning)
        cy.visit(
            '/#/edit?media=https://lib.replayer.app/decisions-by-lidija-roos.ogg',
        );
        cy.get('button[data-cy="insert-cue"]').first().click();

        // ACT (go to the middle of the track)
        cy.get('button[data-cy="toggle-playback"]').first().click();
        cy.get('input[type=range]')
            .as('range')
            .invoke('val', 50)
            .trigger('change');

        // ACT (update cue)
        cy.get('button[data-cy="adjust-cue"]').first().click();

        // ASSERT (that the cue was updated.)
        cy.get('input[type=number][data-cy="input-cue-position"]')
            .invoke('val') // call the val() method to extract the value
            .then((val) => +(val ?? '')) // convert it to a number
            .should('be.least', 50); // also compare it to a number
        //Because it starts to play, it will eventually be greater than the set value
    });
});
