/**
 * @jest-environment jsdom
 */

import { shallowMount } from '@vue/test-utils';
import RezLoader from '@/components/RezLoader.vue';
import { createStore } from 'vuex';
import { MutationTypes } from '@/store/mutation-types';
import { State } from '@/store/state';
import { MediaBlob, MediaUrl } from '@/store/state-types';
import { Compilation, Cue } from '@/store/compilation-types';
import { ActionTypes } from '@/store/action-types';

describe('RezLoader.vue', () => {
    //https://stackoverflow.com/a/56643520
    beforeEach(() => {
        URL.createObjectURL = jest.fn();
    });

    afterEach(() => {
        //https://stackoverflow.com/a/60300568
        (URL.createObjectURL as unknown as jest.Mock).mockReset();
    });
    it('should load an mp3 file as media file', async () => {
        //Arrange

        const store = createStore({
            state() {
                //WORK: can I use a constructor here, instead of manually construct the store here?
                return {
                    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
                    compilation: new Compilation(),

                    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
                    selectedCue: new Cue(),

                    mediaUrls: new Map<string, MediaUrl>(),

                    progressMessageStack: new Array<string>(),

                    neverShowWelcomeMessageAgain: false,
                };
            },
            mutations: {
                [MutationTypes.ADD_MEDIA_URL](state: State, payload: MediaUrl) {
                    state.mediaUrls.set(payload.fileName, payload);
                },
            },
            actions: {
                [ActionTypes.ADD_MEDIA_BLOB]({}, payload: MediaBlob) {
                    URL.createObjectURL(payload.blob);
                },
            },
        });
        const wrapper = shallowMount(RezLoader, {
            global: {
                plugins: [store],
            },
        });

        const dataBase64 = 'VEhJUyBJUyBUSEUgQU5TV0VSCg==';
        const arrayBuffer = Uint8Array.from(window.atob(dataBase64), (c) =>
            c.charCodeAt(0),
        );
        const file = new File([arrayBuffer], 'dummy.pdf', {
            type: 'application/pdf',
        });

        //Act
        wrapper.vm.$store.dispatch(
            ActionTypes.ADD_MEDIA_BLOB,
            new MediaBlob(file.name, file),
        );

        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);

        //Assert the free memory?
    });
});
