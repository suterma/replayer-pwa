import { expect, describe, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import WelcomeText from '@/components/WelcomeText.vue';

describe('WelcomeText.vue', () => {
    it('should render the text', () => {
        const wrapper = shallowMount(WelcomeText);
        expect(wrapper.text()).toContain('How it works');
    });
});
