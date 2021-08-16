<template>
    <div>
        <h1>REZ loader</h1>

        <p>This component loads a .REZ Compilaton into memory</p>

        <h2>1) Select a REZ or ZIP file (will currently omit metadata)</h2>

        <!-- REZ files are ZIP-Files, with just the ending being .REZ -->
        <input
            type="file"
            id="file-input"
            accept=".rez,.zip"
            @change="previewFiles"
        />

        Progress: {{ progressMessage }}

        <h2>2) See the list of included MP3 files (loaded Tracks)</h2>
        <ul>
            <li v-for="track in tracks" :key="track">
                {{ track }}
            </li>
        </ul>

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
import { defineComponent } from 'vue';
import JSZip from 'jszip';
import AudioElement from '@/components/AudioElement.vue';
import { MutationTypes } from '../store/mutation-types'

export default defineComponent({
    name: 'RezLoader',
    components: { AudioElement },
    props: {
        //selectedFileUrl: String,
        //statusMessage: String,
    },
    methods: {
        /** Handles the selection of a REZ file
         * @remarks Displays the contained media files and allows the user to select one for playback
         */
        async previewFiles(event: any) {
            this.$store.commit(MutationTypes.SET_PROGRESS_MESSAGE     ,           'Loading selected file from selection'            );
            //TODO Check that there is actually a REZ file selected, probably throw when more than 1
            var selectedFile = event.target.files[0];
            this.$store.commit(MutationTypes.SET_PROGRESS_MESSAGE     ,                   'Loading ' +
                    selectedFile.name +
                    ' (' +
                    selectedFile.size / 1000000 +
                    'MB)'
            );

            JSZip.loadAsync(selectedFile) // 1) read the Blob
                .then(
                    function (zip) {
                        zip.forEach(function (relativePath, zipEntry) {
                            // 2) print entries
                            this.$store.commit(MutationTypes.SET_PROGRESS_MESSAGE     ,        
                                'Processing content: ' + zipEntry.name
                            );
                            this.$store.commit(MutationTypes.ADD_TRACK     ,        zipEntry.name);

                            zipEntry
                                .async('nodebuffer')
                                .then(function (content): void {
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

                                    this.$store.commit(MutationTypes.SET_PROGRESS_MESSAGE     ,        
                                        'Ready to play fileURL: ' + fileURL
                                    );
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
                    this.$store.commit(MutationTypes.SET_PROGRESS_MESSAGE     ,        
                        'Loading selected REZ file done.'
                    );
                });
        },
    },
    //TODO SEE Options API in https://dev.to/3vilarthas/vuex-typescript-m4j for better typing
    computed: {
        //TODO see why this types are not available: https://github.com/andrewvasilchuk/vuex-typescript/blob/master/src/components/OptionsAPIComponent.vue
        tracks(): Array<string> {
            return this.$store.getters.tracks;
        },
        progressMessage(): string {
            return this.$store.getters.progressMessage;
        },
    },
});
</script>
