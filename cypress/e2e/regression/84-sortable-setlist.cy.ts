import '@4tw/cypress-drag-drop';
/* eslint-disable jest/expect-expect */
describe('testing the issue "Sortable Setlist #84" for regression', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8080/');
        cy.contains('Try the demo').click();
        cy.url().should('include', '#/play');
    });

    it('asserts the fix to the issue', () => {
        // ARRANGE (make a clone of the track to have 2 of them)
        cy.visit('/#/edit');
        cy.get('button.button[title="Track context menu"]').click();
        cy.get('button.dropdown-item').contains('Clone').click();

        // ARRANGE (visit the setlist)
        cy.visit('/#/setlist');

        // ACT (drag to change the order)
        cy.get(
            '#app > section:nth-child(2) > div.container > div:nth-child(4) > div:nth-child(1) .handle.grabbable',
        ).drag(
            '#app > section:nth-child(2) > div.container > div:nth-child(4) > div:nth-child(2)',
        );

        // ASSERT (cloned is now at first position)
        cy.get(
            '#app > section:nth-child(2) > div.container > div:nth-child(4) > div:nth-child(1) span.has-text-weight-light',
        ).should('have.text', 'Not for Sale (cloned)');
    });
});
