/**
 * @jest-environment jsdom
 */

import { shallowMount } from '@vue/test-utils';
import CompilationLoader from '@/components/CompilationLoader.vue';
import { createStore } from 'vuex';
import { MutationTypes } from '@/store/mutation-types';
import { State } from '@/store/state';
import { MediaBlob, MediaUrl, Settings } from '@/store/state-types';
import { Compilation } from '@/store/compilation-types';
import { ActionTypes } from '@/store/action-types';
import { ObjectUrlHandler } from '@/code/storage/ObjectUrlHandler';
import PersistentStorage from '@/store/persistent-storage';
import 'core-js';

describe('CompilationLoader.vue', () => {
    //https://stackoverflow.com/a/56643520
    beforeEach(() => {
        URL.createObjectURL = jest.fn();
    });

    afterEach(() => {
        //https://stackoverflow.com/a/60300568
        (URL.createObjectURL as unknown as jest.Mock).mockReset();
    });

    it('should store a media file, and return an object url', async () => {
        //Arrange

        const store = createStore({
            state() {
                //WORK: can I use a constructor here, instead of manually construct the store here?
                return {
                    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
                    compilation: Compilation.empty(),

                    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
                    selectedCueId: '',

                    mediaUrls: new Map<string, MediaUrl>(),

                    progressMessageStack: new Array<string>(),

                    errorMessageStack: new Array<string>(),

                    settings: Settings.default(),
                };
            },
            mutations: {
                [MutationTypes.ADD_MEDIA_URL](state: State, payload: MediaUrl) {
                    state.mediaUrls.set(payload.resourceName, payload);
                },
            },
            actions: {
                [ActionTypes.ADD_MEDIA_BLOB]({ commit }, mediaBlob: MediaBlob) {
                    const objectUrl = ObjectUrlHandler.createObjectURL(
                        mediaBlob.blob,
                        mediaBlob.fileName,
                    );
                    commit(
                        MutationTypes.ADD_MEDIA_URL,
                        new MediaUrl(mediaBlob.fileName, objectUrl),
                    );
                    //Store persistently, but after committing, to keep the process faster
                    PersistentStorage.storeMediaBlob(mediaBlob);
                },
            },
            getters: {
                settings: (state) => {
                    return state.settings;
                },
            },
        });
        const wrapper = shallowMount(CompilationLoader, {
            global: {
                plugins: [store],
            },
        });
        //Taken from https://github.com/mathiasbynens/small
        const dataBase64 =
            '/+MYxAAAAANIAAAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
        const arrayBuffer = Uint8Array.from(window.atob(dataBase64), (c) =>
            c.charCodeAt(0),
        );
        const file = new File([arrayBuffer], 'mp3.mp3', {
            type: 'audio/mpeg',
        });

        //Act
        wrapper.vm.$store.dispatch(
            ActionTypes.ADD_MEDIA_BLOB,
            new MediaBlob(file.name, file),
        );

        //Assert
        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);

        //Assert the free memory?
    });
});
