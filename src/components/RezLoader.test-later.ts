/*
import { shallowMount } from '@vue/test-utils';
import RezLoader from '@/components/RezLoader.vue';

describe('RezLoader.vue', () => {
    it('should load an mp3 file as media file', async () => {
        //ARRANGE
        //Get the file content
        var url =
            'https://web.replayer.app/demo-compilation-featuring-lidija-roos.rez';
        var response = await fetch(url);
        var blob = await response.blob;
        // const file = new File(
        //     [blob],
        //     url,
        //     //TODO use the mime type from the response to determine the handling
        //     // {
        //     //     type: 'application/zip',
        //     // }
        // );
        //loadFile(file);

        //ACT
        const wrapper = shallowMount(RezLoader, {});
        wrapper.vm.handleAsMediaFromBlob(blob);

        //Assert the free memory?
    });
});
*/
