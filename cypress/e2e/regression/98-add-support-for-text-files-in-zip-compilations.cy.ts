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

describe('loading and displaying of text content with the issue "98-add-support-for-text-files-in-zip-compilations"', () => {
    beforeEach(() => {});

    it('shows the contained text note in the demo', () => {
        cy.loadDemo();
        cy.get('[data-cy="notice-track"]').contains('Click a button').click();
    });

    it('shows the text note after loading a text file', () => {
        cy.loadFile('cypress/fixtures/info.txt');
        cy.get('[data-cy="notice-track"]').contains('Click a button').click();
    });

    it('shows the text note after loading an URL', () => {
        cy.loadMediaUrl('https://lib.replayer.app/demo/README.txt');
        cy.get('[data-cy="notice-track"]')
            .contains('This library is mainly used for testing purposes.')
            .click();
    });

    it('shows the text note also after an app reload', () => {
        // Arrange
        cy.loadFile('cypress/fixtures/info.txt');
        cy.get('[data-cy="notice-track"]').contains('Click a button').click();

        // Act
        cy.reload();

        // Assert
        cy.get('[data-cy="notice-track"]').contains('Click a button').click();
    });
});
