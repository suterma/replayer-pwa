import { mount } from '@cypress/vue'
import ControlKnob from '../../src/ControlKnob.vue'

// @ts-expect-error dont need types here
import CSSUrl from '../../src/assets/index.postcss'

it('Passes msg prop correctly', () => {
  // @ts-expect-error this is ok
  mount(ControlKnob, {
    stylesheet: [CSSUrl],
    propsData: {
      options: {
        tabIndex: 5,
      },
    },
  })

  cy.get('svg').should('contain.attr', 'tabindex', '5')
})
