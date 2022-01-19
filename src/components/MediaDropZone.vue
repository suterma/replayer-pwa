<template>
    <!-- This level is designed that the two input methods can grow and shink, filling up the available horizontal space.
The URL input should be wider, because it should be able to easily deal with lenghty input values -->
    <nav class="level media-drop-zone">
        <div class="level-item has-text-centered">
            <div
                :class="{
                    box: true,
                    button: true,
                    'fill-available': true,
                    'has-background-info-dark': this.isDraggingOver,
                    'has-border-info': this.isDraggingOver,
                }"
                @dragover="dragover"
                @dragleave="dragleave"
                @drop="drop"
            >
                <input
                    type="file"
                    multiple
                    name="fields[assetsFieldHandle][]"
                    id="assetsFieldHandle"
                    class="is-hidden"
                    @change="onChange"
                    ref="file"
                    accept=".rez,.zip,.xml,.rex,.mp3"
                />

                <label for="assetsFieldHandle" class="is-clickable">
                    <span
                        :class="{
                            icon: true,
                        }"
                    >
                        <i class="mdi mdi-24px">
                            <svg
                                style="width: 24px; height: 24px"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                                />
                            </svg>
                        </i>
                    </span>
                    <span> Click or drop to add file(s) </span>
                </label>
            </div>
        </div>

        <div class="level-item has-text-centered">
            <div class="ml-3 mr-3">&mdash; OR &mdash;</div>
        </div>
        <div
            class="level-item has-text-centered is-flex-grow-5 is-flex-shrink-1"
        >
            <div class="field fill-available has-addons">
                <div class="control fill-available">
                    <input
                        class="input"
                        type="url"
                        v-model="url"
                        placeholder="Paste an URL"
                        size="60"
                    />
                </div>
                <div class="control">
                    <button class="button is-primary" @click="fetchUrl">
                        Fetch
                        <!-- Download &amp; use offline -->
                    </button>
                </div>
                <!-- <div class="control">
                    <button class="button is-info" @click="fetchUrl">
                        Use online
                    </button>
                </div> -->
            </div>
        </div>
        <br />
        https://galiander.ca/corogaliano/2022springrehearsal/Down%20to%20the%20river%20to%20pray%20sop.mp3
    </nav>
    Supported items:
    <div class="content">
        <SupportedFilesText />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SupportedFilesText from '@/components/SupportedFilesText.vue';
import { ActionTypes } from '@/store/action-types';
import { Cue, ICue, Track } from '@/store/compilation-types';
import { MutationTypes } from '@/store/mutation-types';
import { v4 as uuidv4 } from 'uuid';
import CompilationParser from '@/store/compilation-parser';
//import { MediaUrl } from '@/store/state-types';

/** Accepts input of files and URLs for tracks, by presenting a drop zone (with file input) and a URL text box
 */
export default defineComponent({
    name: 'MediaDropZone',
    components: { SupportedFilesText },
    props: {},
    delimiters: ['${', '}'], // Avoid Twig conflicts
    data: () => ({
        /** Store our uploaded files
         */
        filelist: new Array<File>(),
        /** Indicates whether there is currently a dragging operation ongoing */
        isDraggingOver: false,

        /** The URL from whitch the media can be fetched from */
        url: '',
    }),
    methods: {
        onChange() {
            this.filelist = [
                ...((this.$refs.file as HTMLInputElement)
                    .files as unknown as File[]),
            ];

            this.loadFiles();
        },
        /** Checks whether a file is supported by examining mime type and/or ending */
        isSupported(file: File): boolean {
            console.log('Filename: ' + file.name);
            console.log('Type: ' + file.type);
            console.log('Size: ' + file.size + ' bytes');

            if (CompilationParser.isSupportedMimeType(file.type)) {
                return true;
            }
            //Check for supported file extensions
            if (file && file.name) {
                const fileExtension = file.name.split('.').pop()?.toLowerCase();
                if (fileExtension) {
                    if (
                        [
                            'mp3',
                            'zip',
                            'rez' /*replayer zip*/,
                            'xml',
                            'rex' /*replaer xml*/,
                        ].includes(fileExtension)
                    ) {
                        return true;
                    }
                }
            }

            console.warn(
                'File with mime type ' + file.type + ' is not supported',
            );
            return false;
        },

        /** Immediately loads all available files by loading their content
         */
        async loadFiles(): Promise<void> {
            Array.from(this.filelist).forEach((file) => {
                if (this.isSupported(file)) {
                    this.loadFile(file);
                }
                this.filelist.pop();
            });
        },

        /** Loads a single file by loading it's content
         */
        async loadFile(file: File): Promise<void> {
            this.$store
                .dispatch(ActionTypes.LOAD_FROM_FILE, file)
                .catch((errorMessage: string) => {
                    this.$store.commit(
                        MutationTypes.PUSH_ERROR_MESSAGE,
                        errorMessage,
                    );
                    //Do not create a new track
                    throw new Error(errorMessage);
                })
                .then(() => {
                    this.createDefaultTrackForFile(file);
                });
        },

        remove(i: number) {
            this.filelist.splice(i, 1);
        },
        dragover(event: DragEvent) {
            event.preventDefault();
            // Add some visual fluff to show the user can drop its files
            console.debug('Dragging over...');
            this.isDraggingOver = true;
        },
        dragleave(/*event: Event*/) {
            // Clean up
            console.debug('Drag leaves');
            this.isDraggingOver = false;
        },
        drop(event: DragEvent) {
            event.preventDefault();
            const draggedFiles = event?.dataTransfer?.files;
            if (draggedFiles) {
                const fileElement = this.$refs.file as HTMLInputElement;
                if (fileElement) {
                    fileElement.files = draggedFiles;
                    this.onChange(); // Trigger the onChange event manually
                    this.isDraggingOver = false;
                }
            }
        },
        /** Fetches a single URL by loading it's content
         */
        fetchUrl(): void {
            //TODO show legal info about download first

            console.debug('MediaDropZone::fetchUrl:event:', this.url);

            if (this.url) {
                this.$store
                    .dispatch(ActionTypes.LOAD_FROM_URL, this.url)
                    .catch((errorMessage: string) => {
                        console.debug(
                            'MediaDropZone::fetchUrl:catch:errorMessage',
                            errorMessage,
                        );
                        this.$store.commit(
                            MutationTypes.PUSH_ERROR_MESSAGE,
                            errorMessage,
                        );
                        throw new Error(errorMessage);
                    })
                    .then(() => {
                        this.createDefaultTrackForUrl(this.url);
                    });
            }
        },
        /** Creates a default track for the given File (Using the File name both as the name and the URL for the track)*/
        createDefaultTrackForFile(file: File) {
            const name = file.name.normalize();
            this.commitNewTrackWithName(name, name);
        },
        /** Creates a default track for the given URL (Using part of the URL as the name, and the original URL as the URL)
         * @remarks The effectively used name for the resource in the local Indexed DB storage, if stored, differs from the URL.
         * It can be derived from the URL by using the CompilationParser.getLocalResourceName() method.
         */
        createDefaultTrackForUrl(url: string) {
            //TODO redefine all those URL parameters as actual URL objects...
            const name = CompilationParser.extractFileNameFromUrl(url);
            this.commitNewTrackWithName(name, url);
        },

        /** Commits a new track with the given name */
        commitNewTrackWithName(name: string, url: string) {
            const newTrack = new Track(
                `New Track for ${name}`,
                '',
                '',
                0,
                url,
                uuidv4(),
                new Array<ICue>(new Cue('Intro', '', 0, null, uuidv4())),
            );
            this.$store.commit(MutationTypes.ADD_TRACK, newTrack);
        },
    },
    computed: {},
});
</script>
<style scoped>
/** Style the box like a typical drop zone */
.box {
    border-width: 1px;
    border-style: dashed;
}

.fill-available {
    width: 100%;
    width: -moz-available; /* WebKit-based browsers will ignore this. */
    width: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
    width: fill-available;
}

.media-drop-zone {
    /** Add a margin at the top, to have a space between this drop zone
    and the possible tracks above it. */
    margin-top: 1.5rem;
}
</style>
