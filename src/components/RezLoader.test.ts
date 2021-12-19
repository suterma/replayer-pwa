/**
 * @jest-environment jsdom
 */

import { shallowMount } from '@vue/test-utils';
import RezLoader from '@/components/RezLoader.vue';
import { createStore } from 'vuex';
import { MutationTypes } from '@/store/mutation-types';
import { State } from '@/store/state';
import { MediaBlob, MediaUrl } from '@/store/state-types';
import { Compilation } from '@/store/compilation-types';
import { ActionTypes } from '@/store/action-types';
import { ObjectUrlHandler } from '@/code/storage/ObjectUrlHandler';
import PersistentStorage from '@/store/persistent-storage';

describe('RezLoader.vue', () => {
    //https://stackoverflow.com/a/56643520
    beforeEach(() => {
        URL.createObjectURL = jest.fn();
    });

    afterEach(() => {
        //https://stackoverflow.com/a/60300568
        (URL.createObjectURL as unknown as jest.Mock).mockReset();
    });
    it('should store an mp3 file as media file, and return an object url', async () => {
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
                };
            },
            mutations: {
                [MutationTypes.ADD_MEDIA_URL](state: State, payload: MediaUrl) {
                    state.mediaUrls.set(payload.fileName, payload);
                },
            },
            actions: {
                [ActionTypes.ADD_MEDIA_BLOB]({ commit }, mediaBlob: MediaBlob) {
                    console.debug(
                        'actions::ADD_MEDIA_BLOB:mediaBlob-filename',
                        mediaBlob.fileName,
                    );

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
