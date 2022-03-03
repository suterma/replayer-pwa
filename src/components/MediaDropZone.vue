<template>
    <!-- This level is designed that the two input methods can grow and shink, filling up the available horizontal space.
The URL input is wider, because it should be able to easily deal with lenghty input values -->
    <div class="level media-drop-zone">
        <div v-if="isExpanded" class="level-item has-text-centered">
            <div
                :class="{
                    box: true,
                    button: true,
                    'fill-available': true,
                    'has-background-info-dark': this.isDraggingOver,
                    'has-border-info': this.isDraggingOver,
                    'is-loading': this.isLoadingFromFile,
                }"
                @dragover="dragover"
                @dragleave="dragleave"
                @drop="drop"
            >
                <input
                    tabindex="10"
                    type="file"
                    multiple
                    name="fields[assetsFieldHandle][]"
                    id="assetsFieldHandle"
                    class="is-hidden"
                    @change="onChange"
                    ref="file"
                    accept=".rex,.xml,.rez,.zip,.mp3,.bplist"
                />

                <label for="assetsFieldHandle" class="is-clickable">
                    <Icon name="plus" />
                    <span> Click or drop to load file(s) </span>
                </label>
            </div>
        </div>

        <!-- The unexpanded plus sign -->
        <div v-if="!isExpanded" class="level-item has-text-centered">
            <div class="ml-3 mr-3">
                <!-- expanded-trigger -->
                <nav>
                    <button
                        class="button"
                        title="Expand media drop zone"
                        @click="expand"
                    >
                        <Icon name="plus" />
                    </button>
                </nav>
            </div>
        </div>

        <!-- The experimental URL loading part -->
        <Experimental>
            <div v-if="isExpanded" class="level-item has-text-centered">
                <div class="ml-3 mr-3">&mdash; OR &mdash;</div>
            </div>
            <div
                v-if="isExpanded"
                class="level-item has-text-centered is-flex-grow-5 is-flex-shrink-1"
            >
                <div class="field fill-available has-addons">
                    <div class="control fill-available">
                        <input
                            tabindex="20"
                            class="input"
                            type="url"
                            v-model="url"
                            placeholder="Paste an URL"
                            size="60"
                        />
                    </div>
                    <!-- //TODO fetch is currenlty not suported at URL load time -->
                    <!-- <div class="control">
                    <button
                        tabindex="30"
                        :class="{
                            button: true,
                            'is-primary': true,
                            'is-loading': this.isLoadingFromUrl,
                        }"
                        @click="fetchUrl"
                    >
                        Fetch
                    </button>
                </div> -->
                    <div class="control">
                        <!-- Use as default, thus set as the submit button -->
                        <button
                            tabindex="40"
                            :class="{
                                button: true,
                                'is-primary': true,
                                'is-loading': this.isUsingMediaFromUrl,
                            }"
                            type="submit"
                            @click="useMediaUrl"
                        >
                            Load

                            <!-- Apply and use online -->
                        </button>
                    </div>
                </div>
            </div>
        </Experimental>
    </div>
    <!-- <div v-if="isExpanded" class="box has-border has-background-transparent">
        <SupportedFilesText />

        <p>
            <a href="https://replayer.app/en/documentation-app" target="_blank"
                >Learn more...</a
            >
        </p>

        Example URLs:
        <br />
        https://web-devel.replayer.app/your-light-by-lidija-roos.mp3
        <br />
        https://galiander.ca/corogaliano/2022springrehearsal/01%20Down%20To%20The%20River%20To%20Pray%202016.mp3
        <br />
        https://galiander.ca/corogaliano/2022springrehearsal/Down%20to%20the%20river%20to%20pray%20sop.mp3
        <br />
        https://galiander.ca/corogaliano/2022springrehearsal/Down%20to%20the%20river%20to%20pray%20alt.mp3
        <br />
        https://galiander.ca/corogaliano/2022springrehearsal/Down%20to%20the%20river%20to%20pray%20ten.mp3
        <br />
        https://galiander.ca/corogaliano/2022springrehearsal/Down%20to%20the%20river%20to%20pray%20bas.mp3
        <br />
    </div> -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ActionTypes } from '@/store/action-types';
import { ICue, Track } from '@/store/compilation-types';
import { MutationTypes } from '@/store/mutation-types';
import { v4 as uuidv4 } from 'uuid';
import FileHandler from '@/store/filehandler';
import Icon from '@/components/icons/Icon.vue';
import Experimental from '@/components/Experimental.vue';

/** Accepts input of files and URLs for tracks, by presenting a drop zone (with file input) and a URL text box
 * @remarks Supports collapsing the control after load, to keep the user more focused
 */
export default defineComponent({
    name: 'MediaDropZone',
    components: { Icon, Experimental },
    props: {
        /** Whether to show the zone in the expanded state */
        isExpanded: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:is-expanded'],
    delimiters: ['${', '}'], // Avoid Twig conflicts
    data: () => ({
        /** Store our uploaded files
         */
        filelist: new Array<File>(),
        /** Indicates whether there is currently a dragging operation ongoing */
        isDraggingOver: false,

        /** The URL from whitch the media can be fetched from */
        url: '',

        /** Whether this component is curretly loading data from an URL */
        isLoadingFromUrl: false,
        /** Whether this component is curretly using media data from an URL */
        isUsingMediaFromUrl: false,
        /** Whether this component is curretly loading data from a file */
        isLoadingFromFile: false,
    }),
    methods: {
        onChange() {
            this.filelist = [
                ...((this.$refs.file as HTMLInputElement)
                    .files as unknown as File[]),
            ];

            this.loadFiles();
        },
        expand() {
            this.$emit('update:is-expanded', true);
        },
        collapse() {
            this.$emit('update:is-expanded', false);
        },
        /** Checks whether a file is supported by examining mime type and/or ending */
        isSupported(file: File): boolean {
            console.log('Filename: ' + file.name);
            console.log('Type: ' + file.type);
            console.log('Size: ' + file.size + ' bytes');

            return FileHandler.isSupportedFile(file);
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
            this.isLoadingFromFile = true;
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
                })
                .finally(() => {
                    this.isLoadingFromFile = false;
                    this.collapse();
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

            console.debug('MediaDropZone::fetchUrl:url:', this.url);
            if (this.url) {
                this.isLoadingFromUrl = true;
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
                        this.createDefaultTrackForUrl(new URL(this.url));
                    })
                    .finally(() => {
                        this.isLoadingFromUrl = false;
                        this.url = ''; //remove the now loaded url
                        this.collapse();
                    });
            }
        },

        /** Uses a single media URL by applying it to a new track */
        useMediaUrl(): void {
            console.debug('MediaDropZone::useMediaUrl:url:', this.url);
            if (this.url) {
                this.isUsingMediaFromUrl = true;
                this.$store
                    .dispatch(ActionTypes.USE_MEDIA_FROM_URL, this.url)
                    .catch((errorMessage: string) => {
                        console.debug(
                            'MediaDropZone::useMediaUrl:catch:errorMessage',
                            errorMessage,
                        );
                        this.$store.commit(
                            MutationTypes.PUSH_ERROR_MESSAGE,
                            errorMessage,
                        );
                        throw new Error(errorMessage);
                    })
                    .then(() => {
                        this.createDefaultTrackForUrl(new URL(this.url));
                    })
                    .finally(() => {
                        this.isUsingMediaFromUrl = false;
                        this.url = ''; //remove the now loaded url
                        this.collapse();
                    });
            }
        },
        /** Creates a default track for the given File (Using the File name both as the name and the URL for the track)*/
        createDefaultTrackForFile(file: File) {
            const fileName = file.name.normalize();
            const nameWithoutExtension = FileHandler.removeExtension(fileName);
            this.commitNewTrackWithName(nameWithoutExtension, '', '', fileName);
        },
        /** Creates a default track for the given URL (Using part of the URL as the name, and the original URL as the URL)
         * @remarks The effectively used name for the resource in the local Indexed DB storage, if stored, differs from the URL.
         * It can be derived from the URL by using the CompilationParser.getLocalResourceName() method.
         */
        createDefaultTrackForUrl(url: URL) {
            const name = FileHandler.extractTrackNameFromUrl(url);
            const artist = FileHandler.extractArtistNameFromUrl(url);
            const album = FileHandler.extractAlbumNameFromUrl(url);
            this.commitNewTrackWithName(name, album, artist, url.toString());
        },

        /** Commits a new track with the given name
         * @param name {string} - The name for the track.
         * @param album {string} - The album name, if any.
         * @param artist {string} - The artist name, if any.
         *  @param - url {string}  The URL or the local file name (possibly including a path) for the media file. If it is relative, it may get made absolute using the compilation's media path.
         */
        commitNewTrackWithName(
            name: string,
            album: string,
            artist: string,
            url: string,
        ) {
            const trackId = uuidv4();
            const newTrack = new Track(
                name,
                album,
                artist,
                0,
                url,
                trackId,
                new Array<ICue>(),
                null,
            );
            this.$store.commit(MutationTypes.ADD_TRACK, newTrack);
        },
    },
    computed: {},
});
</script>
<style scoped>
/** Style the box like a typical drop zone */
.media-drop-zone .box {
    border-width: 1px;
    border-style: dashed;
}

.media-drop-zone {
    /** Add a margin at the top, to have a space between this drop zone
    and the possible tracks above it. */
    margin-top: 1.5rem;
}
</style>
