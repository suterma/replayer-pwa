<template>
    <!-- Header level with wrap for items in the left part.
         Using flex-start on the level, to cause the left and right parts to both 
         begin at the same, upper vertical position -->
    <div
        class="track-header level is-mobile is-align-items-flex-start"
        :class="$attrs.class"
    >
        <!-- Left side -->
        <div class="level-left level-wrap is-justify-content-flex-start">
            <!-- Slot for prepending level items -->
            <slot name="left-start"></slot>

            <!-- Expander -->
            <div
                class="level-item is-narrow"
                v-if="isEditMode && !(/*is single track*/ (isFirst && isLast))"
            >
                <CollapsibleButton
                    v-if="canCollapse"
                    class="is-nav has-text-warning"
                    :modelValue="isExpanded"
                    @update:modelValue="toggleExpanded"
                    title="Track"
                    collapsedText="Click to expand / edit cues"
                    expandedText="Click to collapse"
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
            <template v-if="isEditMode">
                <!-- <div class="level-item"> -->
                <CoveredPanel ref="mediaDropZonePanel">
                    <template #caption>
                        <MediaSourceIndicator
                            :source="track?.Url"
                            :unavailable="!isTrackMediaAvailable"
                        >
                        </MediaSourceIndicator>
                    </template>
                    <MediaDropZone
                        :replaceUrl="track.Url"
                        :trackId="track.Id"
                        ref="mediaDropZone"
                        @accepted="acceptedMedia()"
                    >
                    </MediaDropZone>
                </CoveredPanel>
                <!-- </div> -->

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
                            :modelValue="track?.Name"
                            @change="updateName($event.target.value)"
                            type="text"
                            placeholder="Track name"
                            title="Track name"
                            data-cy="track-name-input"
                            :focusOnMounted="isActive"
                        />
                    </LabeledInput>
                </div>
                <CoveredPanel
                    :revealFor="[track.Artist]"
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
                                    :modelValue="track.Artist"
                                    @update:modelValue="
                                        (value) => {
                                            updateArtist(value);
                                        }
                                    "
                                    type="text"
                                    placeholder="Artist"
                                    title="Artist"
                                    data-cy="track-artist"
                                    focusOnMounted
                                >
                                </StyledInput>
                            </LabeledInput>
                        </p>
                    </div>
                </CoveredPanel>
                <CoveredPanel
                    :revealFor="[track.Album]"
                    title="Album name for this track"
                    class="level-item"
                >
                    <template #caption><span class="label">on</span></template>

                    <div class="field is-fullwidth">
                        <p class="control is-expanded">
                            <LabeledInput label="on">
                                <StyledInput
                                    class="input is-italic"
                                    :modelValue="track.Album"
                                    @update:modelValue="
                                        (value) => {
                                            updateAlbum(value);
                                        }
                                    "
                                    type="text"
                                    placeholder="Album"
                                    title="Album"
                                    data-cy="track-album"
                                    focusOnMounted
                                >
                                </StyledInput>
                            </LabeledInput>
                        </p>
                    </div>
                </CoveredPanel>

                <!-- Pre-Roll (in time) (hide initially, as long as no cues are set) -->
                <CoveredPanel
                    v-if="hasCues || track?.PreRoll"
                    :revealFor="[track.PreRoll]"
                    title="The custom pre-roll duration for in track in [seconds]"
                    class="level-item"
                >
                    <template #caption
                        ><span class="label">Pre-roll</span></template
                    >
                    <LabeledInput label="Pre-roll">
                        <TimeInput
                            class="has-text-right"
                            :modelValue="track.PreRoll"
                            @update:modelValue="
                                (value: number | null) => updatePreRoll(value)
                            "
                            size="9"
                        />
                    </LabeledInput>
                </CoveredPanel>
                <!-- Pre-Roll (in measures) (hide initially, as long as no cues are set) -->
                <CoveredPanel
                    v-if="
                        experimentalUseMeter &&
                        useMeasureNumbers &&
                        (hasCues || track.PreRoll)
                    "
                    :revealFor="[track.PreRoll]"
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
                            :modelValue="track.PreRoll"
                            @update:modelValue="
                                (value: number | null) => updatePreRoll(value)
                            "
                        >
                        </MetricalEditor>
                    </LabeledInput>
                </CoveredPanel>
            </template>
            <template v-else>
                <!-- Artist info (should not take too much width, and hide on small displays anyways)-->
                <div class="level-item is-hidden-mobile">
                    <p class="is-size-7">
                        <ArtistInfo
                            :album="track.Album"
                            :artist="track.Artist"
                            style="max-width: 25vw"
                        />
                    </p>
                </div>
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
                    :iconPath="mdiShareVariant"
                    @click="TrackApi.startSharingTrack(props.track)"
                    data-cy="button-track-share"
                />
                <!-- Slot for additional level action items -->
                <slot name="right-action-items"></slot>

                <PlaybackIndicator
                    :is-ready="!isTrackPlaying && isTrackLoaded"
                    :is-unloaded="!isTrackLoaded"
                    :is-unavailable="!isTrackMediaAvailable"
                    data-cy="playback-indicator"
                />

                <TrackContextMenu
                    v-if="isEditMode"
                    :isFirstTrack="isFirst"
                    :isLastTrack="isLast"
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
import { mdiShareVariant } from '@mdi/js';
import PlaybackIndicator from '@/components/PlaybackIndicator.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import CoveredPanel from '@/components/CoveredPanel.vue';
import MediaSourceIndicator from '@/components/MediaSourceIndicator.vue';
import TimeInput from '@/components/TimeInput.vue';
import MetricalEditor from '@/components/editor/MetricalEditor.vue';
import LabeledInput from '@/components/editor/LabeledInput.vue';
import StyledInput from '@/components/StyledInput.vue';
import TrackContextMenu from '@/components/context-menu/TrackContextMenu.vue';
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import NavButton from '@/components/buttons/NavButton.vue';
import ArtistInfo from '@/components/ArtistInfo.vue';
import { useAppStore } from '@/store/app';
import {
    isPlayingInjectionKey,
    useMeasureNumbersInjectionKey,
} from './TrackInjectionKeys';
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';
import type { ITrack } from '@/store/ITrack';
import { TrackViewMode } from '@/store/TrackViewMode';

const emit = defineEmits(['update:isExpanded', 'click']);

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
    /** Whether this track is the first track in the set of tracks */
    isFirst: {
        type: Boolean,
        required: false,
        default: false,
    },
    /** Whether this track is the last track in the set of tracks */
    isLast: {
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

    /** Flag to indicate whether the player has it's track loaded.
     */
    isTrackLoaded: {
        type: Boolean,
        default: false,
    },

    /** Whether the media source is available
     * @remarks For a file: whether the resource is in the media store
     * @remarks For an URL: //TODO implement
     */
    isTrackMediaAvailable: {
        type: Boolean,
        default: false,
    },

    /** The display mode of this track.
     * @devdoc Allows to reuse this component for more than one view mode.
     * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
     */
    displayMode: {
        type: String as () => TrackViewMode,
        default: TrackViewMode.Play,
    },
});

const app = useAppStore();

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

const isEditMode = computed(() => {
    return props.displayMode === TrackViewMode.Edit;
});

/** Whether this track has any cues */
const hasCues = computed(() => {
    return props.track.Cues.length > 0;
});

/** Flag to indicate whether this track's player is currently playing
 */
const isTrackPlaying = inject(isPlayingInjectionKey);

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
import { type ITrack } from '@/store/ITrack'; import { TrackViewMode } from
'@/store/TrackViewMode';
