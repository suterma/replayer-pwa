import { expect, describe, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import FooterLinks from '@/components/FooterLinks.vue';

describe('WelcomeText.vue', () => {
    it('should render the text', () => {
        const wrapper = shallowMount(FooterLinks);
        expect(wrapper.text()).toContain('How it works');
    });
});
