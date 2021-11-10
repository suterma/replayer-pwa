/**
 * @jest-environment jsdom
 * @devdoc See https://github.com/vuejs/vue-test-utils-next/issues/194#issue-689186727 about the setup with "as any"
 */

import { mount } from '@vue/test-utils';
import WelcomeMessage from '@/components/WelcomeMessage.vue';
describe('WelcomeMessage.vue', () => {
    it('should display the message', () => {
        const wrapper = mount(WelcomeMessage, {
            computed: {
                isNeverShowAgain(): boolean {
                    return false;
                },
            },
            beforeMount() {
                //empty
            },
            //TODO running gives              ReferenceError: globalThis is not defined
        } as any);

        // Assert the rendered text of the component
        expect(wrapper.text()).toContain('Hello world');
    });
});
