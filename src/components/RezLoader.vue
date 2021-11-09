<template>
    <!-- Main container -->
    <nav class="level">
        <!-- Left side -->
        <div class="level-left">
            <div class="level-item">
                <div class="file is-primary">
                    <label class="file-label">
                        <input
                            class="file-input"
                            type="file"
                            id="file-input"
                            accept=".rex,.xml,.rez,.zip,.mp3,.bplist"
                            multiple
                            @change="loadFiles"
                            name="resume"
                        />
                        <span class="file-cta">
                            <!-- //TODO use an SVG upload icon -->
                            <!-- <span class="file-icon">
                        <i class="fas fa-upload"></i>
                    </span> -->
                            <span class="file-label">
                                Choose a compilation or media file…
                            </span>
                        </span>
                        <!-- <span class="file-name">
                    {{selectedFile}}}
                </span> -->
                    </label>
                </div>
            </div>
            <!-- //TODO later implement loading from URL too. Or, maybe, only via query API? -->
            <!-- <div class="level-item">&mdash; OR &mdash;</div>
            <div class="level-item">
                //TODO load from URL
            </div> -->
            <div class="level-item">&mdash; OR &mdash;</div>
            <div class="level-item">
                <button
                    class="button"
                    @click="
                        loadUrl('demo-compilation-featuring-lidija-roos.rez')
                    "
                >
                    Try the demo
                </button>
            </div>
        </div>

        <!-- Right side -->
        <div class="level-right">
            <p class="level-item"></p>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import JSZip from 'jszip';
import xml2js from 'xml2js';
import bplist from 'bplist-parser';
import { MutationTypes } from '../store/mutation-types';
import { MediaFile, RezMimeTypes } from '@/store/state-types';
import NSKeyedUnarchiver from '@suterma/nskeyedunarchiver-liveplayback';

/** A Loader for importable files
 * @remarks Provides a button for loading local files and also listens to url params
 */
export default defineComponent({
    name: 'RezLoader',
    components: {},
    mounted: function (): void {
        //Check whether a given file is to be loaded
        //TODO maybe later put all this params handling in one place; However, yet to decide where is the best place.
        if (this.paramsUrl) {
            if (typeof this.paramsUrl === 'string') {
                //Handle the single item
                this.loadUrl(this.paramsUrl);
            } else {
                //Handle the array
                this.paramsUrl.forEach((url) => this.loadUrl(url));
            }
        }
    },
    methods: {
        /** Handles the request to load a file from an online resource, using a URL
         * @remarks This method can be called multiple times, each resource gets appropriately added to the current compilation
         * @param url - The URL to load the file from
         */
        loadUrl(url: string): void {
            this.$store.commit(
                //Set the progress message, before using any of the async functions
                MutationTypes.SET_PROGRESS_MESSAGE,
                `Loading URL '${url}'...`,
            );
            //TODO make URL to allow any charcter, including slashes etc...
            console.debug('RezLoader::loadUrl:url', url);
            fetch(url)
                .then((res) => res.blob()) // Gets the response and returns it as a blob
                .then((blob) => {
                    // Here's where you get access to the blob
                    // And you can use it for whatever you want
                    const file = new File(
                        [blob],
                        url,
                        //TODO use the mime type from the response to determine the handling
                        // {
                        //     type: 'application/zip',
                        // }
                    );
                    this.loadFile(file);
                })
                .finally(() => {
                    this.$store.commit(MutationTypes.END_PROGRESS);
                });
        },

        /** Executes a function with a progress message.
         * @param message - The message to use for the progress indication
         * @param work - The fuction to call
         * @devdoc Unfortunately nexttick does not work here for single files (The time for render might be too short).
         * Possibly use the hack https://www.npmjs.com/package/vue-force-next-tick if non-rendering of the overlay is
         * actually a relevant problem in the future.
         */
        withProgress(message: string, work: () => void): void {
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
        async loadFiles(event: Event): Promise<void> {
            this.withProgress(`Loading files...`, () => {
                Array.from(
                    (event.target as HTMLInputElement)
                        .files as unknown as File[],
                ).forEach((file) => {
                    this.loadFile(file);
                });
            });
        },

        /** Loads a single file (from a selection of one or more files) by loading their content
         */
        async loadFile(file: File): Promise<void> {
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
                        this.handleAsMediaFromBlob(file.name, file);
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
        loadFileAsRez(selectedFile: File): void {
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

                                        if (mediaFileName.endsWith('.rex')) {
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
                            `un-ZIP: Error reading ${selectedFile.name}: ${e.message}`,
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
        loadFileAsRex(selectedFile: File): void {
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
        loadFileAsLivePlaybackPlaylist(selectedFile: File): void {
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

        /** Handles the given content as the compilation meta data
         */
        handleAsCompilation(content: Buffer, mimeType: RezMimeTypes): void {
            this.withProgress(
                'Parsing compilation (of type ' + mimeType + ')...',
                () => {
                    xml2js
                        .parseStringPromise(content /*, options */)
                        .then((result: string) => {
                            console.debug('Parsed compilation: ', result);

                            //Apply the compilation content to the store
                            this.$store.commit(
                                MutationTypes.UPDATE_COMPILATION_FROM_XML,
                                result,
                            );

                            console.log(mimeType + ' compilation parsing done');
                        })
                        .catch(function (err: Error) {
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
        handleAsLivePlaybackPlaylist(
            content: Buffer,
            mimeType: RezMimeTypes,
        ): void {
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
        ): void {
            //TODO https://stackoverflow.com/questions/21737224/using-local-file-as-audio-src
            const blob = new Blob([content], {
                type: mimeType,
            });
            this.handleAsMediaFromBlob(mediaFileName, blob);
        },

        /** Handles the given blob as media file of the given type
         * @devdoc This is used when a file is already available as blob
         */
        handleAsMediaFromBlob(mediaFileName: string, blob: Blob): void {
            var objectUrl = URL.createObjectURL(blob);
            this.$store.commit(
                MutationTypes.ADD_FILE_URL,
                new MediaFile(mediaFileName, objectUrl),
            );
        },
    },
    computed: {
        paramsUrl(): string | string[] {
            return this.$route.params.url;
        },
    },
});
</script>
