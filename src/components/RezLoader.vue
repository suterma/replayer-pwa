<template>
    <div>
        <!-- REZ files are ZIP-Files, with just the ending being .REZ -->
        <input
            type="file"
            id="file-input"
            accept=".rex,.rez,.zip,.mp3"
            multiple
            @change="loadFile"
        />

        <p>This component loads Compilatons into memory</p>
        The following files are supported: REZ Packages (ZIP Archive with an XML
        compilation and the media files embedded) Single Compilation.xml file
        Single mp3 file Multiple files of the above (Compilations and media
        files are matched by file name)
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import JSZip from 'jszip';
import xml2js from 'xml2js';
import bplist from 'bplist-parser';
import { MutationTypes } from '../store/mutation-types';
import { MediaFile, RezMimeTypes } from '@/store/state-types';

export default defineComponent({
    name: 'RezLoader',
    components: {},
    methods: {
        /** Handles the selection of a file by loading it's content
         * @remarks Parses the contained metadata and loads the media files
         */
        async loadFile(event: any) {
            this.$store.commit(
                MutationTypes.SET_PROGRESS_MESSAGE,
                'Loading selected file(s)...',
            );
            Array.from(event.target.files as File[]).forEach((file) => {
                this.$store.commit(
                    MutationTypes.SET_PROGRESS_MESSAGE,
                    'Loading ' + file.name + ' (' + file.size / 1000000 + 'MB)',
                );

                //Determine the file type
                if (
                    file.name.toLowerCase().endsWith('.rez') ||
                    file.name.toLowerCase().endsWith('.zip')
                ) {
                    this.loadFileAsRez(file);
                }
                if (file.name.toLowerCase().endsWith('.rex')) {
                    this.loadFileAsRex(file);
                }
                if (file.name.toLowerCase().endsWith('.mp3')) {
                    this.loadFileAsMp3(file);
                }
                //Is a LivePlayback playlist?
                if (
                    file.name.toLowerCase().endsWith('.bplist') ||
                    file.name.toLowerCase().endsWith('playlist')
                ) {
                    this.loadFileAsLivePlaybackPlaylist(file);
                }
            });
        },

        /** Loads the given file as a REZ compilation (XML metadata and included media files)
         */
        loadFileAsRez(selectedFile: File) {
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
                                );
                                this.$store.commit(
                                    MutationTypes.ADD_TRACK,
                                    zipEntry.name,
                                );

                                zipEntry
                                    .async('nodebuffer')
                                    .then((content: Buffer): void => {
                                        var mediaFileName = zipEntry.name;

                                        if (
                                            mediaFileName.endsWith(
                                                'ZIP-Compilation.rex',
                                            )
                                        ) {
                                            this.handleAsCompilation(
                                                content,
                                                RezMimeTypes.TEXT_XML,
                                            );
                                        } else if (
                                            mediaFileName.endsWith('.mp3')
                                        ) {
                                            this.handleAsMediaFromContent(
                                                mediaFileName,
                                                content,
                                                RezMimeTypes.AUDIO_MP3,
                                            );
                                        }
                                    });
                            },
                        );
                    },
                    function (e) {
                        console.error(
                            'un-ZIP: Error reading ' +
                                selectedFile.name +
                                ': ' +
                                e.message,
                        );
                    },
                )
                .then(() => {
                    this.$store.commit(
                        MutationTypes.SET_PROGRESS_MESSAGE,
                        'Loading selected REZ file done.',
                    );
                });
        },

        /** Loads the given file as a REX compilation (XML metadata only)
         * @remarks Media files could later be retrieved by trying to download with the metadata info or by explicit file selection by the user
         */
        loadFileAsRex(selectedFile: File) {
            const reader = new FileReader();

            reader.onload = () => {
                //console.debug(                    'RezLoader::loadFileAsRex:reader.result',                    reader.result,                );
                const content = Buffer.from(reader.result as string);
                //console.debug('RezLoader::loadFileAsRex:content', content);

                this.handleAsCompilation(content, RezMimeTypes.TEXT_XML);
            };
            reader.onerror = (event) => {
                // Failed
                console.error(
                    'Failed to read file ' +
                        selectedFile.name +
                        ': ' +
                        reader.error,
                );
                reader.abort(); // (...does this do anything useful in an onerror handler?)
            };
            reader.readAsText(selectedFile);
        },

        /** Loads the given file as a Livelayback playlist (iOS binary property list)
         * @remarks Media files could later be retrieved by trying to download with the metadata info or by explicit file selection by the user
         */
        loadFileAsLivePlaybackPlaylist(selectedFile: File) {
            const reader = new FileReader();

            reader.onload = () => {
                //console.debug(                    'RezLoader::loadFileAsRex:reader.result',                    reader.result,                );
                const content = Buffer.from(reader.result as string);
                console.debug(
                    'RezLoader::loadFileAsLivePlaybackPlaylist:content',
                    content,
                );
                //TODO unfortunately, the buffer is 52210 bytes long as from the content, but the correct size (from the hex editor) should be 45416 bytes
                //TODO we should read the buffer corectly. The initial string bplist00 is correct though
                //TODO probably there is a confusion when reading as binary string (with UTF-8 or some escape characters??)
                //this.handleAsCompilation(content, RezMimeTypes.TEXT_XML);

                (async () => {
                    const obj = await bplist.parseFile(content);

                    console.debug(
                        'RezLoader::loadFileAsLivePlaybackPlaylist:obj',
                        obj,
                    ); //console.log(JSON.stringify(obj));
                })();
            };
            reader.onerror = (event) => {
                // Failed
                console.error(
                    'Failed to read file ' +
                        selectedFile.name +
                        ': ' +
                        reader.error,
                );
                reader.abort(); // (...does this do anything useful in an onerror handler?)
            };
            reader.readAsBinaryString(selectedFile);
        },

        /** Loads the given file as a mp3 media file
         * @remarks
         */
        loadFileAsMp3(selectedFile: File) {
            this.handleAsMediaFromBlob(selectedFile.name, selectedFile);
        },

        /** Handles the given content as the compilation meta data
         */
        handleAsCompilation(content: Buffer, mimeType: RezMimeTypes) {
            console.debug('RezLoader::handleAsCompilation:content', content);
            this.$store.commit(
                MutationTypes.SET_PROGRESS_MESSAGE,
                'Parsing compilation (of type ' + mimeType + ')...',
                content,
            );

            xml2js
                .parseStringPromise(content /*, options */)
                .then((result: any) => {
                    console.debug('Parsed compilation: ', result);

                    //Apply the compilation content to the store
                    this.$store.commit(
                        MutationTypes.UPDATE_COMPILATION,
                        result,
                    );

                    console.log(mimeType + ' compilation parsing done');
                    this.$store.commit(
                        MutationTypes.SET_PROGRESS_MESSAGE,
                        'Compilation parsing (of type ' + mimeType + ') done',
                    );
                })
                .catch(function (err: any) {
                    // Failed
                    console.error(
                        mimeType + ' compilation parsing error: ',
                        err,
                    );
                });
        },
        /** Handles the given content as media file of the given type
         * @devdoc This is used when a file is read from the ZIP package and not yet available as blob
         */
        handleAsMediaFromContent(
            mediaFileName: string,
            content: Buffer,
            mimeType: RezMimeTypes,
        ) {
            console.debug(
                'RezLoader::handleAsMedia:mediaFileName:',
                mediaFileName,
            );
            //TODO https://stackoverflow.com/questions/21737224/using-local-file-as-audio-src
            const blob = new Blob([content], {
                type: mimeType,
            });
            this.handleAsMediaFromBlob(mediaFileName, blob);
        },

        /** Handles the given blob as media file of the given type
         * @devdoc This is used when a file is already available as blob
         */
        handleAsMediaFromBlob(mediaFileName: string, blob: Blob) {
            console.debug(
                'RezLoader::handleAsMediaFromBlob:mediaFileName:',
                mediaFileName,
            );

            var objectUrl = URL.createObjectURL(blob);

            this.$store.commit(
                MutationTypes.SET_PROGRESS_MESSAGE,
                'Ready to play objectUrl: ' +
                    objectUrl +
                    ' (from ' +
                    mediaFileName +
                    ')',
            );
            this.$store.commit(
                MutationTypes.ADD_FILE_URL,
                new MediaFile(mediaFileName, objectUrl),
            );
        },
    },
    computed: {},
});
</script>
