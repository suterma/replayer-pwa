/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

import { mediaSourceUrls } from './../../fixtures/all-types-of-media-urls';

mediaSourceUrls.forEach((mediaSourceUrl) => {
    describe('the cue update button', () => {
        it(`must set the position according the current playback position (using an ${mediaSourceUrl.name} source)`, () => {
            const cuePosition = 10;
            // ARRANGE (create a cue at the beginning)
            cy.load(`/#/edit?media=${mediaSourceUrl.url}`);
            cy.consentIfYouTube(mediaSourceUrl.url);

            cy.get('button[data-cy="insert-cue"]')
                .filter(':visible')
                .first()
                .click();

            // ACT (go to the middle of the track)
            cy.get('button[data-cy="toggle-playback"]').first().click();
            cy.get('input[type=range]')
                .as('range')
                .invoke('val', cuePosition)
                .trigger('change');

            // ACT (allow the seek operation to execute, then should be at least the desired seek position)
            cy.get('[data-cy="current-time"]').contains('00:10.');

            // ACT (update cue)
            cy.get('[data-cy="cue-editors"] button[data-cy="adjust-time"]')
                .filter(':visible')
                .first()
                .click();

            // ASSERT (that the cue was updated)
            let allowedCuePositionTolerance = 0.05;
            // For YouTube, the position can be slightly off, and also early, see
            // https://developers.google.com/youtube/player_parameters#start
            if (mediaSourceUrl.url.startsWith('https://www.youtube.com/')) {
                allowedCuePositionTolerance = 0.5;
            }
            cy.get(
                '[data-cy="cue-editors"] input[type=number][data-cy="input-time-position"]',
            )
                .invoke('val') // call the val() method to extract the value
                .then((val) => +(val ?? '')) // convert it to a number
                .should(
                    'be.within',
                    cuePosition - allowedCuePositionTolerance,
                    cuePosition + allowedCuePositionTolerance,
                ); // also compare it to a number
            //Because it starts to play, it will eventually be greater than the set value}
        });
    });
});
