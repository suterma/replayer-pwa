describe('Homepage', () => {
  /** Asserts the page scrolling behaviour with mouse wheel events
   * @remarks This test is quite challenging, since the mouse
   * wheel event should be triggered on the document, not on a specific
   * element, to be most faithful to real circumstances.
   * However, with Google Chrome at least, this test is misleading,
   * since the cypress events never cause 
   * page scrolling in the first place.
   */
  it('does not scroll when using the mouse wheel', () => {
    // arrange (on a deliberately short viewport)
    cy.viewport(1024, 200);
    cy.visit('/');

    // act
    Cypress._.times(15, (k) => {
      cy.get('#knob1').trigger('wheel', {
        deltaY: -120,
        bubbles: true,
        scrollBehavior: false,
      });
    });
    Cypress._.times(15, (k) => {
      cy.get('#knob1').trigger('wheel', {
        deltaY: 120,
        bubbles: true,
        scrollBehavior: false,
      });
    });

    // assert
    cy.window().its('scrollY').should('equal', 0);
  });

  /** Asserts the page scrolling behaviour with keyboard events
   * @remarks This test is quite challenging.
   * With Google Chrome at least, this test is misleading,
   * since the cypress events never cause 
   * page scrolling in the first place.
   */
  it('does not scroll when using the key clicks', () => {
    // arrange (on a deliberately short viewport)
    cy.viewport(1024, 200);
    cy.visit('/');

    // act
    Cypress._.times(15, (k) => {

      cy.get('#knob1').trigger('keydown', {
        key: "ArrowUp",
        code: "ArrowUp",
        which: 38,
        scrollBehavior: false,
      });
      cy.get('#knob1').trigger('keypress', {
        key: "ArrowUp",
        code: "ArrowUp",
        which: 38,
        scrollBehavior: false,
      });
      cy.get('#knob1').trigger('keyup', {
        key: "ArrowUp",
        code: "ArrowUp",
        which: 38,
        scrollBehavior: false,
      });


    });
    Cypress._.times(15, (k) => {
      cy.get('#knob1').trigger('keydown', {
        keyCode: 40,
        scrollBehavior: false,
      });
      cy.get('#knob1').trigger('keypress', {
        keyCode: 40,
        scrollBehavior: false,
      });
      cy.get('#knob1').trigger('keyup', {
        keyCode: 40,
        scrollBehavior: false,
      });
    });

    // assert
    cy.window().its('scrollY').should('equal', 0);
  });
});
