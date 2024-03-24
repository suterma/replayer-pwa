/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject = any> {
        loadDemo(): void;
        loadMediaUrl(url: string): void;
        loadFile(path: string): void;
        loadEmpty(): void;

        /** Visit the given url
         * @remark This is a safe and simplified overload of cypress's own
         * visit function. This overload fixes interference of the
         * service worker with cypress's handling of the
         * the page's load event.
         * @see https://github.com/cypress-io/cypress/issues/16192#issuecomment-870421667
         * @param url The URL to visit. If relative uses baseUrl
         */
        load(url: string): Cypress.Chainable<Cypress.AUTWindow>;

        consentIfYouTube(url: string): void;
    }
}

Cypress.Commands.add('loadDemo', (): void => {
    visitWithoutServiceWorker('/');
    cy.contains('Try the demo').click();
    // ASSERT that the demo is loaded
    cy.get('.compilation span.title.is-3').contains(
        'Demo Compilation (Featuring Lidija Roos)',
    );
});

/** Loads the given media url using the application's dedicated input field */
Cypress.Commands.add('loadMediaUrl', (url): void => {
    visitWithoutServiceWorker('/');
    cy.get('input[data-cy="input-url"]')
        .type(url)
        .get('button[type="submit"]')
        .click();
});

/** Loads the given file from the fixtures
 * @param {string} path - The path to the file in the fixtures
 */
Cypress.Commands.add('loadFile', (path): void => {
    visitWithoutServiceWorker('/');
    cy.get('input[data-cy="input-file"]').selectFile(path, { force: true });
});

Cypress.Commands.add('loadEmpty', (): void => {
    visitWithoutServiceWorker('/');
});

Cypress.Commands.add(
    'load',
    (url: string): Cypress.Chainable<Cypress.AUTWindow> => {
        return visitWithoutServiceWorker(url);
    },
);

/** Consents to the YouTube consent dialog, if it's a YouTube URL
 * @param {string} url - The resource URL
 */
Cypress.Commands.add('consentIfYouTube', (url): void => {
    if (url.startsWith('https://www.youtube.com')) {
        cy.get('[data-cy="youtube-consent"] button[data-cy="submit-button"]')
            .first()
            .click();
    }
});

/** Visit the given url
 * @remark This is a safe and simplified overload of cypress's own
 * visit function. This overload fixes interference of the
 * service worker with cypress's handling of the
 * the page's load event. It specifically changes the onBeforeLoad option.
 * @see https://github.com/cypress-io/cypress/issues/16192#issuecomment-870421667
 * @param url The URL to visit. If relative uses baseUrl
 */
function visitWithoutServiceWorker(
    url: string,
): Cypress.Chainable<Cypress.AUTWindow> {
    return cy.visit(url, {
        onBeforeLoad(win) {
            delete (win.navigator as any).__proto__.serviceWorker;
            delete (win.navigator as any).serviceWorker;
        },
    });
}
