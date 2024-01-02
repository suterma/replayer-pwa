//TODO fix without the 4tw packages, as it seems to require webpack
//See https://stackoverflow.com/questions/55361499/how-to-implement-drag-and-drop-in-cypress-test
//for a possible solution
// import '@4tw/cypress-drag-drop';
// /* eslint-disable jest/expect-expect */
// describe('testing the issue "Sortable Setlist #84" for regression', () => {
//     beforeEach(() => {
//         cy.loadDemo();
//     });

//     it('asserts the fix to the issue', () => {
//         // ARRANGE (make a clone of the track to have 2 of them)
//         cy.load('/#/edit');
//         cy.get('.track [data-cy="dropdown-menu-trigger"]').click();
//         cy.get('[data-cy="dropdown-menu-item"]').contains('Clone').click();

//         // ARRANGE (visit the setlist)
//         cy.load('/#/setlist');

//         // ACT (drag to change the order)
//         cy.get(
//             '[data-cy="track-list-item"]:nth-child(1) [data-cy="drag-handle"]',
//         ).drag('[data-cy="track-list-item"]:nth-child(2)');

//         // ASSERT (cloned is now at first position)
//         cy.get('[data-cy="track-list-item"]:nth-child(1)').contains(
//             'Not for Sale (cloned)',
//         );
//     });
// });
