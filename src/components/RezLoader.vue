<template>
    <div>
        <h1>REZ loader</h1>

        <p>This component loads a .REZ Compilaton into the local storage</p>

        <h2>1) Select a REZ or ZIP file (will currently omit metadata)</h2>

        <!-- REZ files are ZIP-Files, with just the ending being .REZ -->
        <input
            type="file"
            id="file-input"
            accept=".rez,.zip"
            @change="previewFiles"
        />

        <h2>2) See the list of included MP3 files //TODO</h2>

        <h2>3) The first mp3 will play now</h2>

        <!-- <audio id="audioelement" controls autoplay></audio>
        <div>Selected File URL: {{ sf }}</div>
        ---- -->
        <AudioElement title="TestTitle" artist="TestArtist" album="TestAlbum" />
        <p>
            //TODO later, just display and play the audio selected from the list
            above
        </p>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import JSZip from 'jszip';
import AudioElement from '@/components/AudioElement.vue';
import { ref, watch } from 'vue';

export default {
    components: { AudioElement },
    props: {
        selectedFileUrl: String,
    },

    setup() {
        /** The URL of the selected file
         * @remarks For a REZ source, this is an Object URL from a file blob in the zip file.
         */
        const selectedFileUrl = ref('test');
        return {};
    },
    methods: {
        /** Handles the selection of a REZ file
         * @remarks Displays the contained media files and allows the user to select one for playback
         */
        async previewFiles(event: any) {
            console.debug(
                'Loading selected REZ file from selection: ',
                event.target.files
            );
            //TODO Check that there is actually a REZ file selected, probably throw when more than 1
            var selectedFile = event.target.files[0];

            JSZip.loadAsync(selectedFile) // 1) read the Blob
                .then(
                    function (zip) {
                        zip.forEach(function (relativePath, zipEntry) {
                            // 2) print entries
                            console.log('relativePath: ' + relativePath);
                            console.log('un-ZIP content: ' + zipEntry.name);
                            zipEntry
                                .async('nodebuffer')
                                .then(function (content): void {
                                    console.log('content', content);

                                    //TODO later do this via a property/separate component
                                    //https://stackoverflow.com/questions/21737224/using-local-file-as-audio-src
                                    const blob = new Blob([content], {
                                        type: 'audio/mp3',
                                    });
                                    var fileURL = URL.createObjectURL(blob);
                                    console.debug('fileURL', fileURL);
                                    var audio = document.getElementById(
                                        'audioelement'
                                    ) as HTMLAudioElement;
                                    audio.src = fileURL;
                                    audio.play();

                                    //this.selectedFileUrl = fileURL;
                                });
                        });
                    },
                    function (e) {
                        console.error(
                            'un-ZIP: Error reading ' +
                                selectedFile.name +
                                ': ' +
                                e.message
                        );
                    }
                )
                .then(function () {
                    console.debug('Loading selected REZ file done.');
                });
        },
    },
};
</script>
