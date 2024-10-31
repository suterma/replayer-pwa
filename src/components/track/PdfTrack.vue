<template>
    <div
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
                                <template v-if="showPdfInline">
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
                                            :href="mediaUrl"
                                            target="_blank"
                                        >
                                            {{ track.Name }}
                                        </a>
                                        <a
                                            v-else
                                            :href="mediaUrl"
                                            target="_blank"
                                            disabled
                                        >
                                            {{ track.Name }}
                                        </a>
                                    </span>
                                </p>
                                <TagsDisplay
                                    v-if="!isTrackEditable && trackHasTags"
                                    class="ml-2"
                                    :tags="props.track.Tags"
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
                                            :source="track.Url"
                                            :unavailable="!mediaUrl"
                                            :show-source-icon="false"
                                        >
                                        </MediaSourceIndicator>
                                    </template>
                                    <MediaDropZone
                                        ref="mediaDropZone"
                                        :replace-url="track.Url"
                                        :track-id="track.Id"
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
                                        class="input"
                                        :model-value="track?.Name"
                                        type="text"
                                        placeholder="Track name"
                                        title="Track name"
                                        data-cy="track-name-input"
                                        :focus-on-mounted="false"
                                        @change="
                                            updateName($event.target.value)
                                        "
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
                                v-if="trackHasTags"
                                class="level-item"
                                :tags="props.track.Tags"
                                @remove="removeTag"
                            ></TagsDisplay>
                        </template>
                    </div>
                    <!-- Right side -->
                    <div class="level-right is-justify-content-flex-end">
                        <PlaybackIndicator
                            :state="
                                !!mediaUrl
                                    ? PlaybackState.Ready
                                    : PlaybackState.Unavailable
                            "
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
            <Transition name="item-expand">
                <PdfElement
                    v-if="
                        (isExpanded || isFullscreen) &&
                        mediaUrl &&
                        showPdfInline
                    "
                    class="block"
                    :media-url="mediaUrl"
                    :is-fullscreen="isFullscreen"
                ></PdfElement>
            </Transition>
            <!-- Spacer -->
            <div class="block"></div>
        </FullscreenPanel>
    </div>
</template>

<script setup lang="ts">
/** A track variant that displays a PDF document, either as link or as an expandable inline viewer */
import { type PropType, computed, type Ref, ref, provide, readonly } from 'vue';
import { useAppStore } from '@/store/app';
import type { ITrack } from '@/store/ITrack';
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

const props = defineProps({
    /** The track to display
     */
    track: {
        type: Object as PropType<ITrack>,
        required: true,
    },
});

const app = useAppStore();
const { isTrackEditable } = storeToRefs(app);

const settings = useSettingsStore();
const { showPdfInline } = storeToRefs(settings);

/** Whether the pdf is currently expanded */
const isExpanded = ref(false);

/** Gets the effective media source URL for this track
 */
const mediaUrl = computed(() => {
    return app.getMediaUrlByTrack(props.track);
});

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
    confirm(
        'Removing track',
        `Do you want to remove track "${props.track.Name}"?`,
    ).then((ok) => {
        if (ok) {
            app.removeTrack(props.track.Id);
        }
    });
}

// --- drop zone handling ---

const mediaDropZonePanel: Ref<typeof CoveredPanel | null> = ref(null);

function acceptedMedia() {
    mediaDropZonePanel.value?.cover();
}

// --- update ---

/** Updates the track name */
function updateName(name: string) {
    const trackId = props.track.Id;
    const artist = props.track.Artist;
    const album = props.track.Album;

    app.updateTrackData(trackId, name, artist, album);
}

// --- Tag handling ---

/** Adds the text from the tag input as new tag and clears the input */
function addNewTag(tag: string) {
    const trackId = props.track.Id;
    app.addTag(trackId, tag);
}

function removeTag(tag: string) {
    const trackId = props.track.Id;
    app.removeTag(trackId, tag);
}

const trackHasTags = computed(() => {
    return props.track.Tags.size > 0;
});
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
