<template>
    <!-- This level is designed that the two input methods can grow and shrink, 
        filling up the available horizontal space.
        The URL input is wider, because it should be able to easily deal with 
        lengthy input values -->
    <div
        ref="dropZoneRef"
        class="level media-drop-zone box"
        :class="{
            'is-dropping': isOverDropZone,
        }"
    >
        <div class="level-item has-text-centered">
            <!-- tabindex, to make the label tabbable with focus-->
            <!-- Because the label is tied to the file handler, clicking on it
                 invokes the invisible file input -->
            <!-- @keydown.enter handler to have it working with the enter key, too -->
            <label
                for="assetsFieldHandle"
                class="is-clickable button"
                :title="replaceInfo"
                tabindex="0"
                @keydown.enter="openFile()"
            >
                <input
                    id="assetsFieldHandle"
                    ref="file"
                    v-focus
                    type="file"
                    multiple
                    class="is-hidden"
                    :accept="FileHandler.supportedFileTypes"
                    data-cy="input-file"
                    @change="onChange"
                />
                <template v-if="isReplacementMode">
                    <BaseIcon v-once class="mr-2" :path="mdiSwapHorizontal" />
                    <span>Select / drop to replace file</span>
                </template>
                <template v-else>
                    <BaseIcon v-once class="mr-2" :path="mdiMusicNotePlus" />
                    <span>Select / Drop file(s)</span>
                </template>
            </label>
        </div>

        <!-- The URL loading part (not shown during drop)-->
        <div class="level-item has-text-centered">
            <div class="ml-3 mr-3 is-single-line">&mdash; OR &mdash;</div>
        </div>
        <div class="level-item is-flex-shrink-1">
            <form @submit.prevent="useUrl">
                <div class="field has-addons">
                    <p class="control">
                        <!-- The URL is required for form submit -->
                        <!-- The size should be large for initial input, but fit the smaller area when replacing the source -->
                        <input
                            v-model="url"
                            v-focus
                            class="input"
                            type="url"
                            pattern="^https?://.+$"
                            required
                            :size="isReplacementMode ? 20 : 120"
                            inputmode="url"
                            :title="
                                replaceInfo +
                                'The URL must begin with http:// or https://'
                            "
                            :placeholder="
                                replaceUrl
                                    ? replaceUrl
                                    : 'Paste an URL to a media file or YouTube video'
                            "
                            data-cy="input-url"
                        />
                    </p>
                    <div class="control">
                        <button
                            type="submit"
                            :disabled="!url"
                            class="button is-primary as-after-addon"
                            :class="{
                                'is-loading': isProcessingDataFromUrl,
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

        <!-- A slot for an adornment -->
        <div v-if="$slots.default" class="level-item">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useDropZone } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';
import FileHandler from '@/store/filehandler';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiSwapHorizontal, mdiMusicNotePlus } from '@mdi/js';
import { useAppStore } from '@/store/app';
import { useMessageStore } from '@/store/messages';
import { Route } from '@/router';
import { useRouter } from 'vue-router';

/** Accepts input of files and URLs for tracks and compilations, by presenting a drop zone
 * (with file input) and a URL text box
 * @remarks Supports collapsing the control after load, to keep the user
 * more focused
 * @remarks Supports two modes: "replace", intended to replace an existing
 * source for a single track,
 *  or "add", to add a new source, possibly producing multiple new tracks.
 * @remarks Includes a slot at the end of the indicative text, for an
 * adornment icon of size 40px
 */

const props = defineProps({
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
});

const emit = defineEmits([
    /** One or more files or an URL have been selected and are about to load
     * @remarks This event can be used to trigger a perparatory action
     * for the loading of the resources
     */
    'accepted',
]);

const dropZoneRef = ref<HTMLDivElement>();
const file = ref<HTMLInputElement>();

/** Handles file drop on the drop zone */
function onDrop(files: File[] | null) {
    if (files) {
        loadMediaFiles(files);
    }
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
    onDrop,
    // specify the types of data to be received.
    dataTypes: FileHandler.supportedMimeTypes,
});

/** The URL from which the media can be fetched from */
const url = ref('');

/** Whether this component is currently processing data from an URL */
const isProcessingDataFromUrl = ref(false);

/** Determines whether this control is in the replacement mode */
const isReplacementMode = computed(() => {
    if (props.replaceUrl && props.replaceUrl.length > 0) {
        return true;
    }
    return false;
});

const replaceInfo = computed(() => {
    return isReplacementMode.value ? `Replace: '${props.replaceUrl}'. ` : '';
});

onMounted(() => {
    registerLaunchQueue();
});

const router = useRouter();
const message = useMessageStore();
const app = useAppStore();

/** Registers the consumer for files received via the launch queue
 * @remarks These are handeled similar to when loaded via the file input
 */
function registerLaunchQueue() {
    console.debug('MediaDropZone::registerLaunchQueue');
    if ('launchQueue' in window /*&& 'files' in LaunchParams.prototype*/) {
        console.log('File Handling API is supported!');

        (window as any).launchQueue.setConsumer(
            async (launchParams: { files: unknown }): Promise<void> => {
                const launchFiles =
                    launchParams.files as FileSystemFileHandle[];

                const lauchQueueMessage = `Loading a total of ${launchFiles.length} files from the launch queue`;
                message.pushProgress(lauchQueueMessage);

                const files = new Array<File>();
                for (const fileHandle of launchFiles) {
                    const file: File = await (fileHandle as any).getFile();
                    files.push(file);
                }
                loadMediaFiles(files)
                    .then(() => {
                        console.log(
                            `Totally ${files.length} files (from launch queue) loaded.`,
                        );
                    })
                    .catch((errorMessage: string) =>
                        message.pushError(errorMessage),
                    )
                    .finally(() => {
                        message.popProgress(lauchQueueMessage);
                    });
            },
        );
    } else {
        console.error('File Handling API is not supported!');
    }
}

function openFile() {
    console.debug('MediaDropZone::openFile');
    file.value?.click();
}

function onChange() {
    const files = Array.from(file.value?.files || []);
    loadMediaFiles(files);
}

/** Loads all available media files by loading their content
 * @param files {File[]} - the files to load (Array is required to use the forEach and other functions)
 */
async function loadMediaFiles(files: File[]): Promise<void> {
    console.debug('MediaDropZone::loadMediaFiles');
    emit('accepted');

    files.forEach((file) => {
        loadMediaFile(file);
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

    //If a single package or compilation has been loaded, the intention was most likely to play it
    if (
        files.length === 1 &&
        files[0] &&
        (FileHandler.isSupportedPackageFile(files[0]) ||
            FileHandler.isSupportedCompilationFileName(files[0].name))
    ) {
        router.push(Route.Play);
    } else {
        //otherwise (for a new media file, for example), suggest editing it's track
        router.push(Route.Edit);
    }
}

/** Loads a single media file by loading it's content
 * @param {File} file - Any supported file (package, compilation or media)
 */
async function loadMediaFile(file: File): Promise<void> {
    console.debug('MediaDropZone::loadMediaFile:file.name', file.name);

    app.loadFromFile(file)
        .then(() => {
            if (FileHandler.isSupportedMediaFile(file)) {
                if (isReplacementMode.value) {
                    if (props.trackId) {
                        updateFileForTrack(props.trackId, file);
                    }
                } else {
                    app.addDefaultTrack(file.name);
                }
            }
        })
        .catch((errorMessage: string) => {
            message.pushError(errorMessage);
        });
}

/** Uses a single URL from the URL input and load it's content */
function useUrl(): void {
    console.debug('MediaDropZone::useUrl:url:', url.value);
    emit('accepted');

    if (url.value) {
        isProcessingDataFromUrl.value = true;

        // Determine the type of data that is about to load
        // If unsure, assume it's a media file (possibly from an URL
        // without any file extension in the path)
        let isUsingSingleMediaFile = true;
        if (
            FileHandler.isSupportedPackageFileName(url.value) ||
            FileHandler.isSupportedCompilationFileName(url.value)
        ) {
            isUsingSingleMediaFile = false;
        }

        // Try to load the assumed type
        const load = (url: string) => {
            if (isUsingSingleMediaFile) {
                return app
                    .useMediaFromUrl(url)
                    .catch((errorMessage: string) => {
                        message.pushError(errorMessage);
                    });
            } else {
                return app.loadFromUrl(url).catch((errorMessage: string) => {
                    message.pushError(errorMessage);
                });
            }
        };
        load(url.value)
            .then(() => {
                if (isReplacementMode.value) {
                    if (props.trackId) {
                        updateExistingTrackWithUrl(props.trackId, url.value);
                    }
                } else {
                    // Decide what to do with this new resource:
                    if (isUsingSingleMediaFile) {
                        //If a single new media file has been loaded, the intention was most likely to edit it
                        router.push(Route.Edit);
                        app.addDefaultTrack(url.value);
                    } else {
                        //If a package has been loaded, the intention was most likely to play it
                        router.push(Route.Play);
                    }
                }
            })
            .catch((errorMessage: string) => {
                message.pushError(errorMessage);
            })
            .finally(() => {
                isProcessingDataFromUrl.value = false;
                url.value = ''; //remove the now loaded url
            });
    }
}

/** Replaces the track's URL with a reference to this replacement file
 * @param replacementFile {string} - the File to update the reference to
 * @param trackId {File}- The Id of the track to update
 */
function updateFileForTrack(trackId: string, replacementFile: File): void {
    const fileName = replacementFile.name.normalize();
    updateExistingTrackWithUrl(trackId, fileName);
}

/** Updates an existing track with the given URL
 * @param trackId {string} - The Id of the track to update
 *  @param url {string} - The URL or the local file name (possibly including a path) for the media file. If it is relative, it may get made absolute using the compilation's media path.
 */
function updateExistingTrackWithUrl(
    trackId: string,

    url: string,
) {
    app.updateTrackUrl(trackId, url);
}
</script>
<style scoped>
/* This level is designed to be contained inside other controls, possibly a level itself. Thus, no margin is applied here.
    If you require a typical BULMA level top/bottom margin, you must apply that externally. */
.media-drop-zone {
    margin-top: 0;
    margin-bottom: 0;
}

/** Style the box like a typical drop zone, using a dashed border (initially invisible) */
.media-drop-zone.box {
    border-style: dashed;
    border-color: transparent;

    /* We need just the styles, not the layout of the box */
    padding: 0;
    background: none;

    /* Make sure, the on-drop appearing border is not shifting the layout */
    margin: -2px;
}

/** Show the typical style when dropping */
.media-drop-zone.box.is-dropping {
    border-color: inherit;
}
.media-drop-zone.box.is-dropping > * {
    opacity: 0.5; /* like  'has-opacity-half' */
}
</style>
