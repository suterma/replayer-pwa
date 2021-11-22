/**
 * @jest-environment jsdom
 */

import { shallowMount } from '@vue/test-utils';
import RezLoader from '@/components/RezLoader.vue';
import { createStore } from 'vuex';
import { MutationTypes } from '@/store/mutation-types';
import { State } from '@/store/state';
import { MediaUrl } from '@/store/state-types';
import { Compilation, Cue } from '@/store/compilation-types';

//TODO cleanup this test
//TODO do a memory performance test for the object urls either by hand or with another specific test
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
                //TODO can I use a constructor here, instead of manually construct the store here?
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
                    state.mediaUrls.push(payload);
                },
            },
        });
        const wrapper = shallowMount(RezLoader, {
            global: {
                plugins: [store],
            },
        });

        //Get the file content

        // let blob = new Blob([''], { type: 'text/html' });
        // blob['lastModifiedDate'] = '';
        // blob['name'] = 'filename';
        //let fakeF = <File>blob;

        const dataBase64 = 'VEhJUyBJUyBUSEUgQU5TV0VSCg==';
        const arrayBuffer = Uint8Array.from(window.atob(dataBase64), (c) =>
            c.charCodeAt(0),
        );
        const file = new File([arrayBuffer], 'dummy.pdf', {
            type: 'application/pdf',
        });

        // var url =
        //     'https://web.replayer.app/demo-compilation-featuring-lidija-roos.rez';
        // var response = await fetch(url);
        // var blob = await response.blob;
        // const file = new File(
        //     [blob],
        //     url,
        //     //TODO use the mime type from the response to determine the handling
        //     // {
        //     //     type: 'application/zip',
        //     // }
        // );
        // loadFile(file);

        //Act

        wrapper.vm.handleAsMediaFromBlob(file);

        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);

        //Assert the free memory?
    });
});
