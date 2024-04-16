/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

describe('loading and displaying of PDF content with the issue 144', () => {
    beforeEach(() => {});

    it('shows the contained PDF in the demo', () => {
        cy.loadDemo();
        cy.get('[data-cy="notice-track"]').contains('Click a button').click();
    });

    it('shows the PDF file/text after loading a PDF file', () => {
        cy.loadFile('cypress/fixtures/info.txt');
        cy.get('[data-cy="notice-track"]').contains('Click a button').click();
    });

    it('shows the PDF file/text after loading an URL', () => {
        cy.loadMediaUrl('https://lib.replayer.app/demo/README.txt');
        cy.get('[data-cy="notice-track"]')
            .contains('This library is mainly used for testing purposes.')
            .click();
    });

    it('shows the PDF file/text also after an app reload', () => {
        // Arrange
        cy.loadFile('cypress/fixtures/info.txt');
        cy.get('[data-cy="notice-track"]').contains('Click a button').click();

        // Act
        cy.reload();

        // Assert
        cy.get('[data-cy="notice-track"]').contains('Click a button').click();
    });
});
