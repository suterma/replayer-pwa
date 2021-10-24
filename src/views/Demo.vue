<template>
    <div class="container">
        <h1 class="title">Demo</h1>
        <p>
            Try one of the various compilations to check out the various
            features:
        </p>
        <ul>
            <li>
                <a href="/#/play/demo-compilation-featuring-lidija-roos.rez"
                    >Demo package with a compilation featuring Lidija Roos</a
                ><br />
                A REZ Package containing an REX compilation with 2 tracks and
                matching mp3 files.
            </li>
            <li>
                <a href="/#/play/Demo%20Adonia%20Junior%2021.bplist"
                    >Demo Binary Property List compilation (as from the
                    LivePlayback app)</a
                ><br />
                A bplist file with 21 tracks (no media files).
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import JSZip from 'jszip';
import xml2js from 'xml2js';
import bplist from 'bplist-parser';
import { MutationTypes } from '../store/mutation-types';
import { MediaFile, RezMimeTypes } from '@/store/state-types';
import NSKeyedUnarchiver from '@suterma/nskeyedunarchiver-liveplayback';

export default defineComponent({
    name: 'RezLoader',
    components: {},

    methods: {
        /** Handles the request to load a demo compilation */
        loadDemoCompilation() {
            fetch('demo/Demo%20Compilation%20Featuring%20Lidija%20Roos.rez')
                .then((res) => res.blob()) // Gets the response and returns it as a blob
                .then((blob) => {
                    // Here's where you get access to the blob
                    // And you can use it for whatever you want
                    const file = new File(
                        [blob],
                        'Demo%20Compilation%20Featuring%20Lidija%20Roos.rez.rez',
                        {
                            type: 'application/zip',
                        },
                    );
                    //TODO put file loading code in it's own file, and use from there
                    this.loadFile(file);
                });
        },

        /** Executes a function with a progress message.
         * @param message - The message to use for the progress indication
         * @param work - The fuction to call
         * @devdoc Unfortunately nexttick does not work here for single files (The time for render might be too short).
         * Possibly use the hack https://www.npmjs.com/package/vue-force-next-tick if non-rendering of the overlay is
         * actually a relevant problem in the future.
         */
        withProgress(message: string, work: () => void) {
            (async () => {
                nextTick()
                    .then(() =>
                        this.$store.commit(
                            MutationTypes.SET_PROGRESS_MESSAGE,
                            message,
                        ),
                    )
                    .then(() => work())
                    .finally(() => {
                        this.$store.commit(MutationTypes.END_PROGRESS);
                    });
            })();
        },

        /** Handles the selection of one or more files by loading their content
         */
        async loadFiles(event: any) {
            this.withProgress(`Loading files...`, () => {
                Array.from(event.target.files as File[]).forEach((file) => {
                    this.loadFile(file);
                });
            });
        },

        /** Loads a single file (from a selection of one or more files) by loading their content
         */
        async loadFile(file: File) {
            this.withProgress(
                `Loading file ${file.name} (${file.size / 1000000}MB)`,
                () => {
                    //Determine the file type
                    if (
                        file.name.toLowerCase().endsWith('.rez') ||
                        file.name.toLowerCase().endsWith('.zip')
                    ) {
                        this.loadFileAsRez(file);
                    }
                    if (
                        file.name.toLowerCase().endsWith('.rex') ||
                        file.name.toLowerCase().endsWith('.xml')
                    ) {
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
                },
            );
        },

        /** Loads the given file as a REZ package (Package of a Compilation and included media files)
         */
        loadFileAsRez(selectedFile: File) {
            this.$store.commit(
                //Set the progress message, before using any of the async functions
                MutationTypes.SET_PROGRESS_MESSAGE,
                `Processing file: ${selectedFile.name}`,
            );
            // 1) read the Blob
            JSZip.loadAsync(selectedFile)
                .then(
                    (zip: JSZip) => {
                        zip.forEach(
                            (
                                _relativePath: string,
                                zipEntry: JSZip.JSZipObject,
                            ): void => {
                                this.$store.commit(
                                    //Set the progress message, before using any of the async functions
                                    MutationTypes.SET_PROGRESS_MESSAGE,
                                    `Processing content: ${zipEntry.name}`,
                                );
                                zipEntry
                                    .async('nodebuffer')
                                    .then((content: Buffer): void => {
                                        //See https://stackoverflow.com/questions/69177720/javascript-compare-two-strings-with-actually-different-encoding about normalize
                                        var mediaFileName =
                                            zipEntry.name.normalize();

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
                                        //Is a LivePlayback playlist?
                                        if (
                                            mediaFileName
                                                .toLowerCase()
                                                .endsWith('.bplist') ||
                                            mediaFileName
                                                .toLowerCase()
                                                .endsWith('playlist')
                                        ) {
                                            this.handleAsLivePlaybackPlaylist(
                                                content,
                                                RezMimeTypes.APPLICATION_XBPLIST,
                                            );
                                        }
                                    })
                                    .finally(() => {
                                        this.$store.commit(
                                            MutationTypes.END_PROGRESS,
                                        );
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
                .finally(() => {
                    this.$store.commit(MutationTypes.END_PROGRESS);
                });
        },

        /** Loads the given file as a REX compilation (XML metadata only)
         * @remarks Media files could later be retrieved by trying to download with the metadata info or by explicit file selection by the user
         */
        loadFileAsRex(selectedFile: File) {
            this.withProgress(
                `Loading .rex file '${selectedFile.name}'`,
                () => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const content = Buffer.from(reader.result as string);
                        this.handleAsCompilation(
                            content,
                            RezMimeTypes.TEXT_XML,
                        );
                    };
                    reader.onerror = (): void => {
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
            );
        },

        /** Loads the given file as a Livelayback playlist (iOS binary property list)
         * @remarks Media files could later be retrieved by trying to download with the metadata info or by explicit file selection by the user
         */
        loadFileAsLivePlaybackPlaylist(selectedFile: File) {
            this.withProgress(
                `Loading LivePlayback file '${selectedFile.name}'`,
                () => {
                    const reader = new FileReader();

                    reader.onload = () => {
                        var content = Buffer.from(reader.result as ArrayBuffer);
                        this.handleAsLivePlaybackPlaylist(
                            content,
                            RezMimeTypes.APPLICATION_XBPLIST,
                        );
                    };
                    reader.onerror = (): void => {
                        console.error(
                            'Failed to read file ' +
                                selectedFile.name +
                                ': ' +
                                reader.error,
                        );
                        reader.abort(); // (...does this do anything useful in an onerror handler?)
                    };
                    reader.readAsArrayBuffer(selectedFile);
                },
            );
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
            this.withProgress(
                'Parsing compilation (of type ' + mimeType + ')...',
                () => {
                    xml2js
                        .parseStringPromise(content /*, options */)
                        .then((result: any) => {
                            console.debug('Parsed compilation: ', result);

                            //Apply the compilation content to the store
                            this.$store.commit(
                                MutationTypes.UPDATE_COMPILATION_FROM_XML,
                                result,
                            );

                            console.log(mimeType + ' compilation parsing done');
                        })
                        .catch(function (err: any) {
                            // Failed
                            console.error(
                                mimeType + ' compilation parsing error: ',
                                err,
                            );
                        });
                },
            );
        },
        /** Handles the given content as the compilation meta data
         */
        handleAsLivePlaybackPlaylist(content: Buffer, mimeType: RezMimeTypes) {
            this.withProgress(
                'Parsing compilation (of type ' + mimeType + ')...',
                () => {
                    (async () => {
                        const inputPropertyList = await bplist.parseFile(
                            content,
                        );
                        var unarchivedObject =
                            new NSKeyedUnarchiver().unarchive(
                                inputPropertyList,
                            );
                        //Apply the compilation content to the store
                        this.$store.commit(
                            MutationTypes.UPDATE_COMPILATION_FROM_PLIST,
                            unarchivedObject,
                        );
                    })();
                },
            );
        },

        /** Handles the given content as media file of the given type
         * @devdoc This is used when a file is read from the ZIP package and not yet available as blob
         */
        handleAsMediaFromContent(
            mediaFileName: string,
            content: Buffer,
            mimeType: RezMimeTypes,
        ) {
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
            var objectUrl = URL.createObjectURL(blob);
            this.$store.commit(
                MutationTypes.ADD_FILE_URL,
                new MediaFile(mediaFileName, objectUrl),
            );
        },
    },
    computed: {},
});
</script>
