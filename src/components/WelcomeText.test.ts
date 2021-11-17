/**
 * @jest-environment jsdom
 */

import { mount } from '@vue/test-utils';
import WelcomeText from '@/components/WelcomeText.vue';

describe('WelcomeText.vue', () => {
    it('should render the text', () => {
        const wrapper = mount(WelcomeText);
        expect(wrapper.text()).toContain('Replayer Web App');
    });
});
