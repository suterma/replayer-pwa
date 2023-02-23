/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
    interface Chainable<Subject = any> {
        loadDemo(): void;
        loadMediaUrl(url: string): void;
        loadFile(path: string): void;
        loadEmpty(): void;
    }
}

Cypress.Commands.add('loadDemo', (): void => {
    cy.visit('/');
    cy.contains('Try the demo').click();
    cy.hash().should('eq', '#/play');
});

/** Loads the given media url using the application's dedicated input field */
Cypress.Commands.add('loadMediaUrl', (url): void => {
    cy.visit('/');
    cy.get('input[data-cy="input-file"]')
        .type(url)
        .get('button[type="submit"]')
        .click();
});

/** Loads the given file from the fixtures
 * @param {string} path - The path to the file in the fixtures
 */
Cypress.Commands.add('loadFile', (path): void => {
    cy.visit('/');
    cy.get('input[data-cy="input-file"]').selectFile(path, { force: true });
});

Cypress.Commands.add('loadEmpty', (): void => {
    cy.visit('/');
});
