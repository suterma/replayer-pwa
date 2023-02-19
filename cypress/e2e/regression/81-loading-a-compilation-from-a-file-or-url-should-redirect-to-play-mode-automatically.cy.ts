/* eslint-disable jest/expect-expect */
describe('testing the issue "Loading a compilation from a file or URL should redirect to PLAY mode automatically #81" for regression', () => {
    it('should go to play mode after ZIP compilation load', () => {
        // ACT
        cy.loadMediaUrl(
            'https://lib.replayer.app/demo-compilation-featuring-lidija-roos.rez',
        );

        // ASSERT
        cy.hash().should('eq', '#/play');
    });
    it('should go to play mode after XML compilation load', () => {
        // ACT
        cy.loadMediaUrl(
            'https://lib.replayer.app/Demo%20Compilation%20featuring%20Lidija%20Roos%20%28online%20resources%20of%20multiple%20types%29.rex',
        );

        // ASSERT
        cy.hash().should('eq', '#/play');
    });

    //TODO can I simulate this also with (injected) local files
});
