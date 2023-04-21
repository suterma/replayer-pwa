<template>
    <!-- This level is designed that the two input methods can grow and shrink, filling up the available horizontal space.
The URL input is wider, because it should be able to easily deal with lengthy input values -->
    <div class="level media-drop-zone">
        <div v-if="isExpanded" class="level-item has-text-centered">
            <!-- This is a combined file load and drop zone -->
            <!-- tabindex, to make the label tabbable with focus-->
            <!-- Because the label is tied to the file handler, clicking on it invokes the invisible file input -->
            <!-- @keydown.enter handler to have it working with the enter key, too -->
            <label
                for="assetsFieldHandle"
                class="is-clickable box button"
                :class="{
                    'has-background-info-dark': isDraggingOver,
                    'has-border-info': isDraggingOver,
                    'is-loading': isLoadingFromFile,
                }"
                :title="replaceInfo"
                tabindex="0"
                @dragover="dragover"
                @dragleave="dragleave"
                @drop="drop"
                @keydown.enter="openFile()"
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
                    :accept="acceptedFiles"
                    data-cy="input-file"
                />
                <template v-if="isReplacementMode">
                    <BaseIcon v-once :path="mdiSwapHorizontal" />
                    <span>Click / drop to replace file</span>
                </template>
                <template v-else>
                    <BaseIcon v-once :path="mdiMusicNotePlus" />
                    <span class="is-hidden-desktop">Load file(s)</span>
                    <span class="is-hidden-touch"
                        >Click / drop to load file(s)</span
                    >
                </template>
            </label>
        </div>

        <!-- The unexpanded plus sign -->
        <div v-if="!isExpanded" class="level-item has-text-centered">
            <div class="ml-3 mr-3">
                <!-- expanded-trigger -->
                <button
                    class="button is-nav"
                    title="Add media / expand drop zone"
                    @click="expand"
                >
                    <BaseIcon v-once :path="mdiMusicNotePlus" />
                </button>
            </div>
        </div>

        <!-- The URL loading part -->
        <div v-if="isExpanded" class="level-item has-text-centered">
            <div class="ml-3 mr-3">&mdash; OR &mdash;</div>
        </div>
        <div
            v-if="isExpanded"
            class="level-item has-text-centered is-flex-grow-5 is-flex-shrink-1"
        >
            <form @submit.prevent="useUrl">
                <div class="field has-addons is-flex-grow-5 is-flex-shrink-1">
                    <p class="control is-flex-grow-5 is-flex-shrink-1">
                        <!-- The URL is required for form submit -->
                        <input
                            class="input"
                            type="url"
                            pattern="^https?://.+$"
                            required
                            size="120"
                            inputmode="url"
                            :title="replaceInfo"
                            v-model="url"
                            :placeholder="
                                replaceUrl ? replaceUrl : 'Paste an URL'
                            "
                            v-focus
                            data-cy="input-url"
                        />
                    </p>
                    <!-- Fetch is currently not supported. Download should be done externally by the user -->
                    <Experimental v-if="false" class="control">
                        <button
                            type="button"
                            :disabled="!url"
                            class="button is-primary"
                            :class="{
                                'is-loading': isLoadingFromUrl,
                            }"
                            @click="fetchUrl"
                        >
                            Fetch
                        </button>
                    </Experimental>
                    <div class="control">
                        <button
                            type="submit"
                            :disabled="!url"
                            class="button is-primary"
                            :class="{
                                'is-loading': isUsingMediaFromUrl,
                            }"
                            :title="replaceInfo"
                            data-cy="submit-source"
                        >
                            <template v-if="isReplacementMode">
                                <BaseIcon v-once :path="mdiSwapHorizontal" />
                                <span>Replace</span>
                            </template>
                            <template v-else>
                                <BaseIcon v-once :path="mdiMusicNotePlus" />
                                <span>Use</span>
                            </template>
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <template v-if="offerDemo">
            <div class="level-item has-text-centered">
                <div class="ml-3 mr-3">&mdash; OR &mdash;</div>
            </div>
            <div class="level-item has-text-centered">
                <router-link to="/demo">
                    <button class="button">
                        <span>Try the demo</span>
                    </button></router-link
                >
            </div>
        </template>

        <!-- A slot for an adornment -->
        <div v-if="$slots.default" class="level-item">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ActionTypes } from '@/store/action-types';
import { MutationTypes } from '@/store/mutation-types';
import FileHandler from '@/store/filehandler';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiSwapHorizontal, mdiMusicNotePlus } from '@mdi/js';

/** Accepts input of files and URLs for tracks, by presenting a drop zone (with file input) and a URL text box
 * @remarks Supports collapsing the control after load, to keep the user more focused
 * @remarks Supports two modes: "replace", intended to replace an existing source for a single track,
 *  or "add", to add a new source, possibly producing multiple new tracks.
 * @remarks Includes a slot at the end of the indicative text, for an adornment icon
 * of size 40px
 */
export default defineComponent({
    name: 'MediaDropZone',
    components: { BaseIcon },
    props: {
        /** Whether to show the zone in the expanded state */
        isExpanded: {
            type: Boolean,
            default: false,
        },
        /** The URL/file name of the media source to replace
         * @remarks If set, the single-file "replace" mode is considered active
         * @remarks In the store, the file is not replaced, since it may be used by other tracks.
         */
        replaceUrl: {
            type: String,
            default: undefined,
        },
        /** The track Id of the track, whose media source is to replace
         * @remarks If set, the single-file "replace" mode is considered active
         */
        trackId: {
            type: String,
            default: undefined,
        },
        /** Whether to offer a demo button */
        offerDemo: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:is-expanded'],
    data() {
        return {
            /** Indicates whether there is currently a dragging operation ongoing */
            isDraggingOver: false,

            /** The URL from which the media can be fetched from */
            url: '',

            /** Whether this component is currently loading data from an URL */
            isLoadingFromUrl: false,
            /** Whether this component is currently using media data from an URL */
            isUsingMediaFromUrl: false,
            /** Whether this component is currently loading data from a file */
            isLoadingFromFile: false,

            /** Icons from @mdi/js */
            mdiSwapHorizontal: mdiSwapHorizontal,
            mdiMusicNotePlus: mdiMusicNotePlus,
        };
    },
    methods: {
        openFile() {
            console.debug('MediaDropZone::openFile');
            (this.$refs.file as HTMLInputElement).click();
        },
        onChange() {
            const files = (this.$refs.file as HTMLInputElement)
                .files as unknown as File[];
            this.loadMediaFiles(files);
        },
        expand() {
            this.$emit('update:is-expanded', true);
        },
        collapse() {
            this.$emit('update:is-expanded', false);
        },
        /** Checks whether a file is supported by examining mime type and/or the file name (by prefix/suffix) */
        isSupported(file: File): boolean {
            console.log('Filename: ' + file.name);
            console.log('Type: ' + file.type);
            console.log('Size: ' + file.size + ' bytes');

            return FileHandler.isSupportedFile(file);
        },

        /** Immediately loads all available media files by loading their content
         */
        async loadMediaFiles(files: File[]): Promise<void> {
            console.debug('MediaDropZone::loadMediaFiles');
            // Array is required to use the forEach and other functions
            const filesArray = Array.from(files);
            filesArray.forEach((file) => {
                this.loadMediaFile(file);
            });

            console.table(
                filesArray.map(function (file) {
                    return {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                    };
                }),
            );

            //If a single package or compilation has been loaded, the intention was most likely to play it
            if (
                filesArray.length === 1 &&
                filesArray[0] &&
                (FileHandler.isSupportedPackageFile(filesArray[0]) ||
                    FileHandler.isSupportedCompilationFileName(
                        filesArray[0].name,
                    ))
            ) {
                this.$router.push('play');
            } else {
                //otherwise (for a new media file, for example), suggest editing it's track
                this.$router.push('edit');
            }
        },

        /** Loads a single media file by loading it's content
         * @param {File} file - Any supported file (package, compilation or media)
         */
        async loadMediaFile(file: File): Promise<void> {
            console.debug('MediaDropZone::loadMediaFile:file.name', file.name);

            this.isLoadingFromFile = true;
            this.$store
                .dispatch(ActionTypes.LOAD_FROM_FILE, file)

                .then(() => {
                    if (FileHandler.isSupportedMediaFile(file)) {
                        if (this.isReplacementMode) {
                            if (this.trackId) {
                                this.updateFileForTrack(this.trackId, file);
                            }
                        } else {
                            this.$store.commit(
                                MutationTypes.ADD_DEFAULT_TRACK,
                                file.name,
                            );
                        }
                    }
                })
                .catch((errorMessage: string) => {
                    this.$store.commit(MutationTypes.PUSH_ERROR, errorMessage);
                })
                .finally(() => {
                    this.isLoadingFromFile = false;
                    this.collapse(); //This component
                });
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
            console.debug('MediaDropZone::fetchUrl:url:', this.url);
            if (this.url) {
                this.isLoadingFromUrl = true;
                this.$store
                    .dispatch(ActionTypes.LOAD_FROM_URL, this.url)
                    .then(() => {
                        if (this.isReplacementMode) {
                            if (this.trackId) {
                                this.updateExistingTrackWithUrl(
                                    this.trackId,
                                    this.url,
                                );
                            }
                        }
                    })
                    .catch((errorMessage: string) => {
                        this.$store.commit(
                            MutationTypes.PUSH_ERROR,
                            errorMessage,
                        );
                    })
                    .finally(() => {
                        this.isLoadingFromUrl = false;
                        this.url = ''; //remove the now loaded url
                        this.collapse();
                    });
            }
        },

        /** Uses a single URL by applying it to a new track */
        useUrl(): void {
            console.debug('MediaDropZone::useUrl:url:', this.url);
            if (this.url) {
                this.isUsingMediaFromUrl = true;

                // Determine the type of data to load
                let actionType = ActionTypes.USE_MEDIA_FROM_URL;
                if (
                    FileHandler.isSupportedPackageFileName(this.url) ||
                    FileHandler.isSupportedCompilationFileName(this.url)
                ) {
                    actionType = ActionTypes.LOAD_FROM_URL;
                }

                // Try to load the assumed type
                this.$store
                    .dispatch(actionType, this.url)
                    .then(() => {
                        if (this.isReplacementMode) {
                            if (this.trackId) {
                                this.updateExistingTrackWithUrl(
                                    this.trackId,
                                    this.url,
                                );
                            }
                        } else {
                            // Decide what to do with this new resource:
                            if (actionType == ActionTypes.LOAD_FROM_URL) {
                                //If a package has been loaded, the intention was most likely to play it
                                this.$router.push('play');
                            } else {
                                //If a single new media file has been loaded, the intention was most likely to edit it
                                this.$router.push('edit');
                                this.$store.commit(
                                    MutationTypes.ADD_DEFAULT_TRACK,
                                    this.url,
                                );
                            }
                        }
                    })
                    .catch((errorMessage: string) => {
                        this.$store.commit(
                            MutationTypes.PUSH_ERROR,
                            errorMessage,
                        );
                    })
                    .finally(() => {
                        this.isUsingMediaFromUrl = false;
                        this.url = ''; //remove the now loaded url
                        this.collapse();
                    });
            }
        },

        /** Replaces the track's URL with a reference to this replacement file
         * @param {replacementFile} - the File to update the reference to
         * @param {trackId} - The Id of the track to update
         */
        updateFileForTrack(trackId: string, replacementFile: File): void {
            const fileName = replacementFile.name.normalize();
            this.updateExistingTrackWithUrl(trackId, fileName);
        },

        /** Updates an existing track with the given URL
         * @param trackId {string} - The Id of the track to update
         *  @param url {string} - The URL or the local file name (possibly including a path) for the media file. If it is relative, it may get made absolute using the compilation's media path.
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
        replaceInfo(): string {
            return this.isReplacementMode
                ? `Replace: '${this.replaceUrl}'. The URL must begin with http:// or https://`
                : `The URL must begin with http:// or https://`;
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
