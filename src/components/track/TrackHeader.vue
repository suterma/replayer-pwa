<template>
    <!-- Header level with wrap for items in the left part.
         Using flex-start on the level, to cause the left and right parts to both 
         begin at the same, upper vertical position -->
    <div class="track-header level is-mobile is-align-items-flex-start">
        <!-- Left side -->
        <div class="level-left level-wrap is-justify-content-flex-start">
            <!-- Slot for prepending level items -->
            <slot name="left-start"></slot>

            <!-- Expander -->
            <div
                v-if="isTrackEditable && canCollapse"
                class="level-item is-narrow"
            >
                <CollapsibleButton
                    v-if="canCollapse"
                    class="is-nav has-text-warning"
                    :model-value="isExpanded"
                    title="Track"
                    collapsed-text="Click to expand / edit cues"
                    expanded-text="Click to collapse"
                    @update:model-value="toggleExpanded"
                    ><span
                        :class="{
                            'is-invisible':
                                isExpanded || track.Cues.length == 0,
                        }"
                        class="tag is-warning is-rounded"
                        >{{ track.Cues.length }}</span
                    ></CollapsibleButton
                >
            </div>

            <!-- The edit part -->
            <template v-if="isTrackEditable">
                <CoveredPanel
                    ref="mediaDropZonePanel"
                    :icon-path="mdiSwapVertical"
                >
                    <template #caption>
                        <MediaSourceIndicator
                            :source="track?.Url"
                            :unavailable="!isTrackMediaAvailable"
                            show-size
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

                <!-- Title (make it wide)-->
                <div class="level-item is-flex-grow-1">
                    <LabeledInput
                        label="Title"
                        class="is-fullwidth"
                        :class="{
                            'has-text-success': isActive,
                        }"
                    >
                        <StyledInput
                            class="input"
                            :class="{ 'has-text-success': isActive }"
                            :model-value="track?.Name"
                            type="text"
                            placeholder="Track name"
                            title="Track name"
                            data-cy="track-name-input"
                            :focus-on-mounted="isActive"
                            @change="updateName($event.target.value)"
                        />
                    </LabeledInput>
                </div>
                <CoveredPanel
                    :reveal-for="[track.Artist]"
                    title="Artist name for this track"
                    class="level-item"
                >
                    <template #caption>
                        <span class="label">by</span>
                    </template>

                    <div class="field is-fullwidth">
                        <p class="control is-expanded">
                            <LabeledInput label="by">
                                <StyledInput
                                    class="input is-italic"
                                    :model-value="track.Artist"
                                    type="text"
                                    placeholder="Artist"
                                    title="Artist"
                                    data-cy="track-artist"
                                    focus-on-mounted
                                    @update:model-value="
                                        (value) => {
                                            updateArtist(value);
                                        }
                                    "
                                >
                                </StyledInput>
                            </LabeledInput>
                        </p>
                    </div>
                </CoveredPanel>
                <CoveredPanel
                    :reveal-for="[track.Album]"
                    title="Album name for this track"
                    class="level-item"
                >
                    <template #caption><span class="label">on</span></template>

                    <div class="field is-fullwidth">
                        <p class="control is-expanded">
                            <LabeledInput label="on">
                                <StyledInput
                                    class="input is-italic"
                                    :model-value="track.Album"
                                    type="text"
                                    placeholder="Album"
                                    title="Album"
                                    data-cy="track-album"
                                    focus-on-mounted
                                    @update:model-value="
                                        (value) => {
                                            updateAlbum(value);
                                        }
                                    "
                                >
                                </StyledInput>
                            </LabeledInput>
                        </p>
                    </div>
                </CoveredPanel>

                <!-- Pre-Roll (in time) (hide initially, as long as no cues are set) -->
                <CoveredPanel
                    v-if="hasCues || track?.PreRoll"
                    :reveal-for="[track.PreRoll != null]"
                    title="The custom pre-roll duration for in track in [seconds]"
                    class="level-item"
                >
                    <template #caption
                        ><span class="label">Pre-roll</span></template
                    >
                    <LabeledInput label="Pre-roll">
                        <TimeInput
                            class="has-text-right"
                            :model-value="track.PreRoll"
                            size="9"
                            @update:model-value="
                                (value: number | null) => updatePreRoll(value)
                            "
                        />
                        <template #addon>
                            <div
                                v-show="track.PreRoll"
                                class="control"
                                title="Reset pre-roll for this track"
                            >
                                <button
                                    class="button as-after-addon"
                                    @click="updatePreRoll(null)"
                                >
                                    <BaseIcon
                                        v-once
                                        :path="mdiTrashCanOutline"
                                    />
                                </button>
                            </div>
                        </template>
                    </LabeledInput>
                </CoveredPanel>
                <!-- Pre-Roll (in measures) (hide initially, as long as no cues are set) -->
                <CoveredPanel
                    v-if="
                        experimentalUseMeter &&
                        useMeasureNumbers &&
                        (hasCues || track.PreRoll)
                    "
                    :reveal-for="[track.PreRoll]"
                    title="The custom pre-roll duration in this track in [measures]"
                    class="level-item"
                >
                    <template #caption
                        ><span v-experiment="true" class="label"
                            >Pre-roll (measures)</span
                        ></template
                    >
                    <LabeledInput
                        v-experiment="true"
                        label="Pre-roll (measures)"
                    >
                        <MetricalEditor
                            differential
                            :model-value="track.PreRoll"
                            @update:model-value="
                                (value: number | null) => updatePreRoll(value)
                            "
                        >
                        </MetricalEditor>
                    </LabeledInput>
                </CoveredPanel>

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
            <!-- Slot for additional level items -->
            <slot name="left-additional"></slot>
        </div>

        <!-- Right side -->
        <div class="level-right is-justify-content-flex-end">
            <div class="level-item">
                <!-- Slot for additional level display items -->
                <slot name="right-start"></slot>
                <NavButton
                    v-if="experimentalAllowTrackSharingByLink"
                    v-experiment="experimentalAllowTrackSharingByLink"
                    title="Share..."
                    :icon-path="mdiShareVariant"
                    data-cy="button-track-share"
                    @click="TrackApi.startSharingTrack(props.track)"
                />
                <!-- Slot for additional level action items -->
                <slot name="right-action-items"></slot>
                <TrackContextMenu
                    v-if="isTrackEditable"
                    :track="track"
                ></TrackContextMenu>
            </div>
            <!-- Slot for additional level items -->
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
/** A header for editing "beats per minute" track metadata
 */
import {
    type PropType,
    type Ref,
    computed,
    inject,
    ref,
    watchEffect,
} from 'vue';
import { TrackApi } from '@/code/api/TrackApi';
import { mdiShareVariant, mdiSwapVertical, mdiTrashCanOutline } from '@mdi/js';
import PlaybackIndicator from '@/components/indicators/PlaybackIndicator.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import CoveredPanel from '@/components/CoveredPanel.vue';
import MediaSourceIndicator from '@/components/indicators/MediaSourceIndicator.vue';
import TimeInput from '@/components/TimeInput.vue';
import MetricalEditor from '@/components/editor/MetricalEditor.vue';
import LabeledInput from '@/components/editor/LabeledInput.vue';
import TagInput from '@/components/editor/TagInput.vue';
import TagsDisplay from '@/components/displays/TagsDisplay.vue';
import StyledInput from '@/components/StyledInput.vue';
import TrackContextMenu from '@/components/context-menu/TrackContextMenu.vue';
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import NavButton from '@/components/buttons/NavButton.vue';
import { useAppStore } from '@/store/app';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import {
    isPlayingInjectionKey,
    playbackStateInjectionKey,
    useMeasureNumbersInjectionKey,
} from './TrackInjectionKeys';
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';
import type { ITrack } from '@/store/ITrack';

const emit = defineEmits(['update:isExpanded']);

const props = defineProps({
    track: {
        type: Object as PropType<ITrack>,
        required: true,
    },

    /** Whether this track is to be considered as the active track */
    isActive: {
        type: Boolean,
        required: false,
        default: false,
    },
    /** Whether this track is expanded */
    isExpanded: {
        type: Boolean,
        default: false,
    },

    /** Whether this track can collapse
     * @remarks If set to false, this prevents collapsing
     * and also hides the collapsing toggler completely
     * This is useful for single-track compilations where
     * collapsing is not useful
     */
    canCollapse: {
        type: Boolean,
        default: true,
    },

    /** Whether the current track can play (the media is loaded to the extent that it's ready to play).
     * @remarks This is used to toggle playback button states
     */
    canPlay: {
        type: Boolean,
        default: false,
    },

    /** Whether the media source is available
     */
    isTrackMediaAvailable: {
        type: Boolean,
        default: false,
    },
});

const app = useAppStore();

const { isTrackEditable } = storeToRefs(app);

const settings = useSettingsStore();
const { experimentalUseMeter, experimentalAllowTrackSharingByLink } =
    storeToRefs(settings);

const useMeasureNumbers = inject(useMeasureNumbersInjectionKey);

/** Toggles the expansion state
 */
function toggleExpanded(): void {
    if (props.canCollapse) {
        emit('update:isExpanded', !props.isExpanded);
    }
}

/** Handles the expanded state
 * @remarks If this track becomes active, it will always expand
 * @remarks Make sure for non-collapsible headers, they are reported (at least initially) as expanded
 */
watchEffect(() => {
    if (!props.canCollapse) {
        emit('update:isExpanded', true);
    } else {
        if (props.isActive) {
            emit('update:isExpanded', true);
        }
    }
});

/** Updates the track name */
function updateName(name: string) {
    const trackId = props.track.Id;
    const artist = props.track.Artist;
    const album = props.track.Album;

    app.updateTrackData(trackId, name, artist, album);
}

/** Updates the track artist */
function updateArtist(artist: string) {
    const trackId = props.track.Id;
    const name = props.track.Name;
    const album = props.track.Album;
    app.updateTrackData(trackId, name, artist, album);
}

/** Updates the track album */
function updateAlbum(album: string) {
    const trackId = props.track.Id;
    const name = props.track.Name;
    const artist = props.track.Artist;
    app.updateTrackData(trackId, name, artist, album);
}

/** Updates the track pre-roll */
function updatePreRoll(preRoll: number | null) {
    const trackId = props.track.Id;
    app.updateTrackPreRoll(trackId, preRoll);
}

/** Whether this track has any cues */
const hasCues = computed(() => {
    return props.track.Cues.length > 0;
});

/** Flag to indicate whether this track's player is currently playing
 */
const isTrackPlaying = inject(isPlayingInjectionKey);

/** Indicates this track's playback state
 * @remarks This is used to depict the expected action on button press. While playing, this is pause, and vice versa.
 */
const playbackState = inject(playbackStateInjectionKey);

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

// --- drop zone handling ---

const mediaDropZonePanel: Ref<typeof CoveredPanel | null> = ref(null);

function acceptedMedia() {
    mediaDropZonePanel.value?.cover();
}
</script>

<style lang="scss">
/** Tie the label texts more to the respective editor fields */
.track.is-editable .field.is-horizontal .field-label {
    margin-right: 0.75em; /* similar to the in-field margin */
}
</style>

<style lang="scss" scoped>
/** Custom modification for the level in the context of a track.
* @remarks Allow the title text (on the left) to break between words, 
* and keep the context items (on the right) as close as reasonably possible */
.level {
    .level-left {
        word-break: break-word;
        /* This basis is set empirically to fit for the elements on the right */
        /* from zero: peaks and indicator is shown */
        flex-basis: calc(100% - 70px);

        /* from zero, when editing: peaks, indicator and menu icon is shown */
        .is-editable {
            flex-basis: calc(100% - 130px);
        }

        /* from tablet: time, peaks, volume and indicator is shown */
        @media screen and (min-width: 769px) {
            flex-basis: calc(100% - 190px);
        }
    }

    .level-right {
        min-width: 0;

        /* Keep the right hand items as small as possible */
        flex-basis: 0;

        /* These items should keep their size */
        .level-item {
            flex-shrink: 0;
            flex-grow: 0;
            text-align: right;
        }
    }
}

.is-editable .level {
    .level-left {
        /* from zero, when editing: peaks, indicator and menu icon is shown */
        flex-basis: calc(100% - 130px);
    }
}
</style>
