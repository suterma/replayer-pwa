/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

import { expect, describe, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import FooterLinks from '@/components/FooterLinks.vue';

describe('WelcomeText.vue', () => {
    it('should render the text', () => {
        const wrapper = shallowMount(FooterLinks);
        expect(wrapper.text()).toContain('How it works');
    });
});
