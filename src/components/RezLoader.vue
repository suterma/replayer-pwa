<template>
    <div>
        <!-- REZ files are ZIP-Files, with just the ending being .REZ -->
        <input
            type="file"
            id="file-input"
            accept=".rez,.zip"
            @change="previewFiles"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import JSZip from 'jszip'
import xml2js from 'xml2js'
import { MutationTypes } from '../store/mutation-types'
import { MediaFile, RezMimeTypes } from '@/store/state-types'

export default defineComponent({
    name: 'RezLoader',
    components: {},
    methods: {
        /** Handles the selection of a REZ file
         * @remarks Displays the contained media files and allows the user to select one for playback
         */
        async previewFiles(event: any) {
            this.$store.commit(
                MutationTypes.SET_PROGRESS_MESSAGE,
                'Loading selected file...',
            )
            //TODO Check that there is actually a REZ file selected, probably throw when more than 1
            var selectedFile = event.target.files[0]
            this.$store.commit(
                MutationTypes.SET_PROGRESS_MESSAGE,
                'Loading ' +
                    selectedFile.name +
                    ' (' +
                    selectedFile.size / 1000000 +
                    'MB)',
            )

            JSZip.loadAsync(selectedFile) // 1) read the Blob
                .then(
                    (zip: JSZip) => {
                        zip.forEach(
                            (
                                relativePath: string,
                                zipEntry: JSZip.JSZipObject,
                            ) => {
                                // 2) print entries
                                this.$store.commit(
                                    MutationTypes.SET_PROGRESS_MESSAGE,
                                    'Processing content: ' + zipEntry.name,
                                )
                                this.$store.commit(
                                    MutationTypes.ADD_TRACK,
                                    zipEntry.name,
                                )

                                zipEntry
                                    .async('nodebuffer')
                                    .then((content: Buffer): void => {
                                        var mediaFileName = zipEntry.name

                                        if (
                                            mediaFileName.endsWith(
                                                'ZIP-Compilation.rex',
                                            )
                                        ) {
                                            this.handleAsCompilation(
                                                content,
                                                RezMimeTypes.TEXT_XML,
                                            )
                                        } else if (
                                            mediaFileName.endsWith('.mp3')
                                        ) {
                                            this.handleAsMedia(
                                                mediaFileName,
                                                content,
                                                RezMimeTypes.AUDIO_MP3,
                                            )
                                        }
                                    })
                            },
                        )
                    },
                    function (e) {
                        console.error(
                            'un-ZIP: Error reading ' +
                                selectedFile.name +
                                ': ' +
                                e.message,
                        )
                    },
                )
                .then(() => {
                    this.$store.commit(
                        MutationTypes.SET_PROGRESS_MESSAGE,
                        'Loading selected REZ file done.',
                    )
                })
        },
        /** Handles the given content as the XML compilation meta data
         */
        handleAsCompilation(content: Buffer, mimeType: RezMimeTypes) {
            console.debug('RezLoader::handleAsCompilation')
            this.$store.commit(
                MutationTypes.SET_PROGRESS_MESSAGE,
                'Parsing compilation (of type ' + mimeType + ')...',
            )

            xml2js
                .parseStringPromise(content /*, options */)
                .then((result: any) => {
                    console.debug('Parsed compilation: ', result)

                    //Apply the compilation content to the store
                    this.$store.commit(MutationTypes.UPDATE_COMPILATION, result)

                    console.log(mimeType + ' compilation parsing done')
                    this.$store.commit(
                        MutationTypes.SET_PROGRESS_MESSAGE,
                        'Compilation parsing (of type ' + mimeType + ') done',
                    )
                })
                .catch(function (err: any) {
                    // Failed
                    console.error(
                        mimeType + ' compilation parsing error: ',
                        err,
                    )
                })
        },
        /** Handles the given content as media file of the given type
         */
        handleAsMedia(
            mediaFileName: string,
            content: Buffer,
            mimeType: RezMimeTypes,
        ) {
            console.debug(
                'RezLoader::handleAsMedia:mediaFileName:',
                mediaFileName,
            )
            //TODO https://stackoverflow.com/questions/21737224/using-local-file-as-audio-src
            const blob = new Blob([content], {
                type: mimeType,
            })
            var objectUrl = URL.createObjectURL(blob)

            this.$store.commit(
                MutationTypes.SET_PROGRESS_MESSAGE,
                'Ready to play objectUrl: ' +
                    objectUrl +
                    ' (from ' +
                    mediaFileName +
                    ')',
            )
            this.$store.commit(
                MutationTypes.ADD_FILE_URL,
                new MediaFile(mediaFileName, objectUrl),
            )
        },
    },
    computed: {},
})
</script>
