/**
 * @jest-environment jsdom
 * @devdoc See https://github.com/vuejs/vue-test-utils-next/issues/194#issue-689186727 about the setup with "as any"
 */

import { mount } from '@vue/test-utils';
import WelcomeText from '@/components/WelcomeText.vue';

describe('WelcomeText.vue', () => {
    it('should render the text', () => {
        const wrapper = mount(WelcomeText);
        expect(wrapper.text()).toContain('Replayer Web App');
    });
});
