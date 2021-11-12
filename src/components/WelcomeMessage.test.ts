/**
 * @jest-environment jsdom
 * @devdoc See https://github.com/vuejs/vue-test-utils-next/issues/194#issue-689186727 about the setup with "as any"
 */

// see https://stackoverflow.com/questions/69939335/how-to-mock-a-computed-property-when-testing-a-vue3-app-with-jest

import { mount } from '@vue/test-utils';
import WelcomeMessage from '@/components/WelcomeMessage.vue';

describe('WelcomeMessage.vue', () => {
    it('should display the message', () => {
        const wrapper = mount(WelcomeMessage, {
            computed: {
                isNeverShowAgain() {
                    return false;
                },
            },
        } as any);
        // wrapper.vm.setComputed({ isNeverShowAgain: false }); //Deprecated and does not work

        // Assert the rendered text of the component
        expect(wrapper.text()).toContain('Welcome');
    });
});
