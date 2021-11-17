/**
 * @jest-environment jsdom
 */

import { shallowMount } from '@vue/test-utils';
import RezLoader from '@/components/RezLoader.vue';

describe('RezLoader.vue', () => {
    //https://stackoverflow.com/a/56643520
    URL.createObjectURL = jest.fn();
    afterEach(() => {
        //URL.createObjectURL.mockReset();
    });
    it('should load an mp3 file as media file', async () => {
        //Arrange

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
        const wrapper = shallowMount(RezLoader, {});
        wrapper.vm.handleAsMediaFromBlob(file);

        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);

        //Assert the free memory?
    });
});
