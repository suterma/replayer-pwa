<template>
    <div
        v-scroll.top="isActiveTrack && isTrackPlayable"
        class="track is-together-print is-inactive-track is-pdf block"
        data-cy="track-pdf"
        :class="{
            'is-editable': isTrackEditable,
        }"
    >
        <FullscreenPanel
            v-slot="{
                isFullscreen,
                hasNative: hasNativeFullscreenSupport,
                toggle,
            }"
        >
            <div v-if="!isFullscreen" class="block">
                <!-- Each track is an item in a list -->
                <div
                    class="track-header level is-mobile is-align-items-flex-start"
                >
                    <!-- Left side -->
                    <div
                        class="level-left level-wrap is-justify-content-flex-start"
                    >
                        <template v-if="!isFullscreen">
                            <div class="level-item is-narrow">
                                <template v-if="renderPdfInline">
                                    <!-- Offer the native full screen, if available -->
                                    <FullscreenToggler
                                        v-if="hasNativeFullscreenSupport"
                                        class="is-nav"
                                        :disabled="!Boolean(mediaUrl)"
                                        :model-value="isFullscreen"
                                        title="Toggle full-screen mode"
                                        @click="toggle"
                                    ></FullscreenToggler>
                                    <!-- A "full page" mode is not offered, the "expanded mode" fills this gap -->
                                    <!-- Always offer the expander -->
                                    <CollapsibleButton
                                        class="is-nav"
                                        :disabled="!Boolean(mediaUrl)"
                                        :model-value="isExpanded"
                                        title="PDF"
                                        collapsed-text="Click to expand / show PDF"
                                        expanded-text="Click to collapse"
                                        @update:model-value="
                                            isExpanded = !isExpanded
                                        "
                                    >
                                    </CollapsibleButton>
                                </template>
                                <!-- Icon and link -->
                                <p
                                    class="control is-flex is-align-items-center"
                                >
                                    <span
                                        class="has-text-break-word is-indicator"
                                    >
                                        <!-- NOTE: Toggling the disabled attribute does not work as intended -->
                                        <a
                                            v-if="Boolean(mediaUrl)"
                                            class="notranslate"
                                            :href="mediaUrl"
                                            target="_blank"
                                        >
                                            {{ name }}
                                        </a>
                                        <a
                                            v-else
                                            class="notranslate"
                                            :href="mediaUrl"
                                            target="_blank"
                                            disabled
                                        >
                                            {{ name }}
                                        </a>
                                    </span>
                                </p>
                                <TagsDisplay
                                    v-if="!isTrackEditable && hasTags"
                                    class="ml-2"
                                    :tags="tags"
                                    small
                                    readonly
                                ></TagsDisplay>
                            </div>
                        </template>

                        <!-- Edit -->
                        <template v-if="isTrackEditable">
                            <div class="level-item is-narrow">
                                <!-- The edit title and file part -->
                                <CoveredPanel
                                    ref="mediaDropZonePanel"
                                    :icon-path="mdiSwapVertical"
                                    class="level-item"
                                >
                                    <template #caption>
                                        <MediaSourceIndicator
                                            :source="trackUrl"
                                            :unavailable="!mediaUrl"
                                            :show-source-icon="false"
                                        >
                                        </MediaSourceIndicator>
                                    </template>
                                    <MediaDropZone
                                        ref="mediaDropZone"
                                        :replace-url="trackUrl"
                                        :track-id="trackId"
                                        @accepted="acceptedMedia()"
                                    >
                                    </MediaDropZone>
                                </CoveredPanel>
                            </div>
                            <!-- Title (make it wide) -->
                            <div class="level-item is-flex-grow-2">
                                <LabeledInput
                                    label="Title"
                                    class="is-fullwidth"
                                >
                                    <StyledInput
                                        v-model="name"
                                        class="input"
                                        type="text"
                                        placeholder="Track name"
                                        title="Track name"
                                        data-cy="track-name-input"
                                    />
                                </LabeledInput>
                            </div>
                            <!-- Tags -->
                            <CoveredPanel title="Tag" class="level-item">
                                <template #caption
                                    ><span class="label">Tags</span></template
                                >
                                <TagInput @new-tag="addNewTag"></TagInput>
                            </CoveredPanel>
                            <TagsDisplay
                                v-if="hasTags"
                                class="level-item"
                                :tags="tags"
                                @remove="removeTag"
                            >
                            </TagsDisplay>
                        </template>
                    </div>
                    <!-- Right side -->
                    <div class="level-right is-justify-content-flex-end">
                        <PlaybackIndicator
                            :state="playbackState"
                            :playback-icon-path="mdiFilePdfBox"
                            data-cy="playback-indicator"
                            paused-text="PDF track"
                        />

                        <button
                            v-if="isTrackEditable"
                            :disabled="!Boolean(mediaUrl)"
                            class="button"
                            title="Remove the PDF track from the compilation"
                            @click="remove"
                        >
                            <BaseIcon v-once :path="mdiTrashCanOutline" />
                        </button>
                    </div>
                </div>
            </div>
            <div ref="pdfContainer" class="block">
                <Transition name="item-expand">
                    <PdfElement
                        v-if="
                            (isExpanded || isFullscreen) &&
                            mediaUrl &&
                            renderPdfInline
                        "
                        :url="mediaUrl"
                        :is-fullscreen="isFullscreen"
                    ></PdfElement>
                </Transition>
            </div>
        </FullscreenPanel>
    </div>
</template>

<script setup lang="ts">
/** A track variant that displays a PDF document, either as link or as an expandable inline viewer */
import {
    computed,
    type Ref,
    ref,
    provide,
    watch,
    readonly,
    onUnmounted,
} from 'vue';
import { useAppStore } from '@/store/app';
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import CoveredPanel from '@/components/CoveredPanel.vue';
import PlaybackIndicator from '@/components/indicators/PlaybackIndicator.vue';
import MediaSourceIndicator from '@/components/indicators/MediaSourceIndicator.vue';
import LabeledInput from '@/components/editor/LabeledInput.vue';
import StyledInput from '@/components/StyledInput.vue';
import FullscreenPanel from '@/components/FullscreenPanel.vue';
import FullscreenToggler from '@/components/buttons/FullscreenToggler.vue';
import { mdiSwapVertical, mdiFilePdfBox, mdiTrashCanOutline } from '@mdi/js';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { storeToRefs } from 'pinia';
import PdfElement from '@/components/track/PdfElement.vue';
import { playbackStateInjectionKey } from './TrackInjectionKeys';
import { useSettingsStore } from '@/store/settings';
import { confirm } from '@/code/ui/dialogs';
import TagInput from '@/components/editor/TagInput.vue';
import TagsDisplay from '@/components/displays/TagsDisplay.vue';
import { PlaybackState } from '@/code/media/PlaybackState';
import { useTrackStore } from '@/store/track/index';
import FileHandler from '@/store/filehandler';
import { useElementScroll } from '@/composables/ElementScrollComposable';
import { unrefElement } from '@vueuse/core';

const props = defineProps({
    /** The id of the track to handle
     */
    trackId: {
        type: String,
        required: true,
    },
});

const app = useAppStore();
const { isTrackEditable, isTrackPlayable } = storeToRefs(app);

const settings = useSettingsStore();
const { showPdfInline } = storeToRefs(settings);

// --- tracking the associated ITrack

/** The dynamic track store for this component.
 * @remarks Code inside the setup script runs once per component instance,
 * thus the track store must be destroyed after component unload.
 */
const trackStore = useTrackStore(props.trackId);
const { mediaUrl, hasTags, tags, name, trackUrl, isActiveTrack } =
    storeToRefs(trackStore);

onUnmounted(() => {
    trackStore.$dispose();
});

// --- pdf state ---

/** Whether to render PDF content inline.
 * @remarks Do not try to render online PDF content inline, because it typically
 * fails due to CORS.
 */
const renderPdfInline = computed(() => {
    return showPdfInline && !FileHandler.isValidHttpUrl(mediaUrl.value ?? '');
});

/** Whether the pdf is currently expanded */
const isExpanded = ref(false);

/** Indicates this track's playback state
 * @devdoc This is just provided to avoid a console warning;
 *  PDF's can not play
 */
const playbackState = computed(() => {
    if (!mediaUrl.value) {
        return PlaybackState.Unavailable;
    }
    return PlaybackState.Ready;
});

/**
 * @devdoc This is just provided to avoid a console warning;
 *  PDF's can not play
 */
provide(playbackStateInjectionKey, readonly(playbackState));

/** Removes the track from the compilation
 */
function remove() {
    confirm('Removing track', `Do you want to remove track "${name}"?`).then(
        (ok) => {
            if (ok) {
                app.removeTrack(props.trackId);
            }
        },
    );
}

// --- drop zone handling ---

const mediaDropZonePanel: Ref<typeof CoveredPanel | null> = ref(null);

function acceptedMedia() {
    mediaDropZonePanel.value?.cover();
}

// --- scrolling ---

const pdfContainer = ref();

/** When the PDF view expands, it should scroll to the top to "auto-fit"
 * @remarks Implements #156
 */
watch(isExpanded, (isExpanded) => {
    if (isExpanded === true) {
        const pdf = unrefElement(pdfContainer);
        const { scroll } = useElementScroll(pdf);
        scroll();
    }
});

// --- Tag handling ---

/** Adds the text from the tag input as new tag and clears the input */
function addNewTag(tag: string) {
    app.addTag(props.trackId, tag);
}

function removeTag(tag: string) {
    app.removeTag(props.trackId, tag);
}
</script>

<style lang="scss">
/* PDF Track item styles*/
.track.is-pdf {
    /* Define an overall width allocation for fixed right-hand side of the playback control level items*/

    .level {
        .level-left {
            /* 
        The value for the basis have been empirically found to work best on
        Google Chrome, Brave and Firefox, on Ubuntu
        for the given set of playback controls
        (slider, next/previous cue, playback mode, pre-roll toggler, fading toggler, volume knob, playback indicator)*/
            flex-basis: calc(100% - 0px);

            .level-item {
                flex-shrink: 1;
            }
        }

        .level-right {
            flex-basis: 0px;

            .level-item {
                flex-shrink: 1;
            }
        }
    }

    /*Note: For PDF tracks, the used width is smaller than in edit mode, 
since there are less buttons on the right side (no track skip, no play/pause)*/
    .level.is-editable {
        .level-left {
            flex-basis: auto;
        }

        .level-right {
            flex-basis: auto;
        }
    }
}
</style>
