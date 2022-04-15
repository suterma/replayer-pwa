<template>
    <!-- This level is designed that the two input methods can grow and shink, filling up the available horizontal space.
The URL input is wider, because it should be able to easily deal with lenghty input values -->
    <div class="level media-drop-zone">
        <div v-if="isExpanded" class="level-item has-text-centered">
            <!-- This is a combined file load and drop zone -->
            <!-- tabindex, to make the label tabbable with focus-->
            <!-- Because the label is tied to the file handler, clicking on it invokes the invisible file input -->
            <!-- @keydown.enter handler to have it working with the enter key, too -->
            <label
                for="assetsFieldHandle"
                class="is-clickable"
                :class="{
                    box: true,
                    button: true,
                    'fill-available': true,
                    'has-background-info-dark': this.isDraggingOver,
                    'has-border-info': this.isDraggingOver,
                    'is-loading': this.isLoadingFromFile,
                }"
                tabindex="0"
                @dragover="dragover"
                @dragleave="dragleave"
                @drop="drop"
                @keydown.enter="openFile()"
                v-focus
            >
                <input
                    v-focus
                    type="file"
                    multiple
                    name="fields[assetsFieldHandle][]"
                    id="assetsFieldHandle"
                    class="is-hidden"
                    @change="onChange"
                    ref="file"
                    :accept="this.acceptedFiles"
                />
                <template v-if="this.isReplacementMode">
                    <Icon name="swap-horizontal" />
                    <span>Click or drop to replace file</span>
                </template>
                <template v-else>
                    <Icon name="plus" />
                    <span>Click or drop to load file(s)</span>
                </template>
            </label>
        </div>

        <!-- The unexpanded plus sign -->
        <div v-if="!isExpanded" class="level-item has-text-centered">
            <div class="ml-3 mr-3">
                <!-- expanded-trigger -->
                <button
                    class="button is-nav"
                    title="Expand media drop zone"
                    @click="expand"
                >
                    <Icon name="plus" />
                </button>
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
                            class="input"
                            type="url"
                            inputmode="url"
                            v-model="url"
                            placeholder="Paste an URL"
                            size="60"
                        />
                    </div>
                    <!-- //TODO fetch is currenlty not suported at URL load time -->
                    <!-- <div class="control">
                    <button
                      
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
                            :disabled="!this.url"
                            :class="{
                                button: true,
                                'is-primary': true,
                                'is-loading': this.isUsingMediaFromUrl,
                            }"
                            type="submit"
                            @click="useMediaUrl"
                        >
                            <template v-if="this.isReplacementMode">
                                <Icon name="swap-horizontal" />
                                <span>Replace</span>
                            </template>
                            <template v-else>
                                <Icon name="plus" />
                                <span>Use</span>
                            </template>
                        </button>
                    </div>
                </div>
            </div>
        </Experimental>
    </div>
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
 * @remarks Supports two modes: "replace", intended to replace an existing source, or "add", to add a new source.
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
        /** The URL/file name of the media source to replace
         * @remarks If set, the single-file replacement mode is considered active
         * @remarks In the store, the file is not replaced, since it may be used by other tracks.
         */
        replaceUrl: {
            type: String,
            default: undefined,
        },
        /** The track Id of the track, whose media source is to replace
         * @remarks If set, the single-file replacement mode is considered active
         */
        trackId: {
            type: String,
            default: undefined,
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
        openFile() {
            console.debug('MediaDropZone::openFile');
            (this.$refs.file as HTMLInputElement).click();
        },
        onChange() {
            this.filelist = [
                ...((this.$refs.file as HTMLInputElement)
                    .files as unknown as File[]),
            ];

            this.loadFiles();
        },
        expand() {
            console.debug('MediaDropZone::expand');
            this.$emit('update:is-expanded', true);
        },
        collapse() {
            console.debug('MediaDropZone::collapse');
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
            const files = Array.from(this.filelist);
            files.forEach((file) => {
                this.loadFile(file);
                this.filelist.pop();
            });

            console.table(
                files.map(function (file) {
                    return {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                    };
                }),
            );

            //If a single package or complilation has been loaded, the intention was most likely to play it
            if (
                files.length === 1 &&
                files[0] &&
                (FileHandler.isSupportedPackageFile(files[0]) ||
                    FileHandler.isSupportedCompilationFileName(files[0].name))
            ) {
                this.$router.push('play');
            } else {
                //otherwise (for a new media file, for example), suggest editing it's track
                this.$router.push('edit');
            }
        },

        /** Loads a single file by loading it's content
         * @param {file} - Any supported file (package, compilation or media)
         */
        async loadFile(file: File): Promise<void> {
            console.debug('MediaDropZone::loadFile:file.name', file.name);

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
                    //For new media sources, create a default track
                    if (FileHandler.isSupportedMediaFile(file)) {
                        if (!this.isReplacementMode) {
                            this.createDefaultTrackForFile(file);
                        } else {
                            //Replace the URL for this track
                            if (this.trackId) {
                                this.updateFileForTrack(this.trackId, file);
                            }
                        }
                    }
                })
                .finally(() => {
                    this.isLoadingFromFile = false;
                    this.collapse(); //This component
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
                        if (!this.isReplacementMode) {
                            this.createDefaultTrackForUrl(new URL(this.url));
                        } else {
                            //Replace the URL for this track
                            if (this.trackId) {
                                this.updateExistingTrackWithUrl(
                                    this.trackId,
                                    this.url,
                                );
                            }
                        }
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
                    .then(() => {
                        if (!this.isReplacementMode) {
                            this.createDefaultTrackForUrl(new URL(this.url));
                        } else {
                            //Replace the URL for this track
                            if (this.trackId) {
                                this.updateExistingTrackWithUrl(
                                    this.trackId,
                                    this.url,
                                );
                            }
                        }
                    })
                    .finally(() => {
                        this.isUsingMediaFromUrl = false;
                        this.url = ''; //remove the now loaded url
                        this.collapse();
                    });
            }
        },
        /** Creates a default track for the given Media File (Using the File name both as the name and the URL for the track)*/
        createDefaultTrackForFile(file: File) {
            const fileName = file.name.normalize();
            const nameWithoutExtension = FileHandler.removeExtension(fileName);
            this.commitNewTrackWithName(nameWithoutExtension, '', '', fileName);
        },

        /** Replaces the track's URL with a reference to this replacement file
         * @param {replacementFile} - the File to update the reference to
         * @param {trackId} - The Id of the track to update
         */
        updateFileForTrack(trackId: string, replacementFile: File): void {
            const fileName = replacementFile.name.normalize();
            this.updateExistingTrackWithUrl(trackId, fileName);
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
        /** Updates an existing track with the given URL
         * @param {trackId} - The Id of the track to update
         *  @param - url {string}  The URL or the local file name (possibly including a path) for the media file. If it is relative, it may get made absolute using the compilation's media path.
         */
        updateExistingTrackWithUrl(
            trackId: string,

            url: string,
        ) {
            this.$store.commit(MutationTypes.UPDATE_TRACK_URL, {
                trackId,
                url,
            });
        },
    },
    computed: {
        acceptedFiles(): string {
            return FileHandler.acceptedFileList;
        },
        /** Determines whether this control is in the replacement mode */
        isReplacementMode(): boolean {
            if (this.replaceUrl && this.replaceUrl.length > 0) {
                return true;
            }
            return false;
        },
    },
});
</script>
<style scoped>
/** Style the box like a typical drop zone */
.media-drop-zone .box {
    border-width: 1px;
    border-style: dashed;
}

/* This level is designed to be contained inside other controls, possibly a level itself. Thus, no margin is applied here. 
    If you require a typical BULMA level top/bottom margin, you must apply that externally. */
.media-drop-zone {
    margin-top: 0;
    margin-bottom: 0;
}
</style>
