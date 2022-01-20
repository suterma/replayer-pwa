/**
 * @jest-environment jsdom
 */

import { mount } from '@vue/test-utils';
import WelcomeMessage from '@/components/WelcomeMessage.vue';
import { createStore } from 'vuex';
import { Settings } from '@/store/state-types';

/** Testing the visibility of the welcome message with jest
 * @devdoc Using a mocked store, as per https://next.vue-test-utils.vuejs.org/guide/advanced/vuex.html#testing-with-a-real-vuex-store
 * does not work, due to unknown reasons. It seems that the mounting process can not effectively read from the mocked store
 */
describe('WelcomeMessage.vue', () => {
    it('should display the message when dismissal not set', () => {
        //Arrange
        const store = createStore({
            getters: {
                settings() {
                    let settings = Settings.default();
                    settings.neverShowWelcomeMessageAgain = false;
                    return settings;
                },
            },
        });
        //Act
        const wrapper = mount(WelcomeMessage, {
            global: {
                plugins: [store],
            },
        });
        //Assert
        expect(wrapper.isVisible()).toBe(true);
        expect(wrapper.text()).toContain('Welcome');
    });

    it('should not display the message when dismissed', () => {
        const store = createStore({
            getters: {
                settings() {
                    let settings = Settings.default();
                    settings.neverShowWelcomeMessageAgain = true;
                    return settings;
                },
            },
        });
        const wrapper = mount(WelcomeMessage, {
            global: {
                plugins: [store],
            },
        });
        expect(wrapper.isVisible()).toBe(false);
        expect(wrapper.text()).not.toContain('Welcome');
    });
});
