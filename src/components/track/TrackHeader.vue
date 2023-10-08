<template>
    <!-- Header level with wrap for items in the left part.
         Using flex-start on the level, to cause the left and right parts to both 
         begin at the same, upper vertical position -->
    <div
        class="level is-mobile is-align-items-flex-start"
        :class="$attrs.class"
    >
        <!-- Left side -->
        <div class="level-left level-wrap is-justify-content-flex-start">
            <!-- Slot for additional level items -->
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
                    ><span></span
                ></CollapsibleButton>
            </div>

            <!-- The edit part -->
            <template v-if="isEditMode">
                <div class="level-item">
                    <MediaEdit :trackId="trackId" :trackUrl="trackUrl">
                        <span
                            v-if="!isTrackMediaAvailable"
                            class="has-text-warning"
                        >
                            <BaseIcon v-once :path="mdiAlert" />Media
                            unavailable
                        </span>
                    </MediaEdit>
                </div>

                <!-- Title -->
                <div class="level-item">
                    <LabeledInput label="Title">
                        <StyledInput
                            class="input"
                            :class="{ 'has-text-success': isActive }"
                            :modelValue="trackName"
                            @change="updateName($event.target.value)"
                            type="text"
                            placeholder="Track name"
                            title="Track name"
                            data-cy="track-name"
                        />
                    </LabeledInput>
                </div>
                <CloakedPanel
                    :revealFor="[trackArtist, trackAlbum]"
                    class="level-item"
                >
                    <template #caption
                        ><span class="label">Artist / Album</span></template
                    >

                    <ArtistLevelEditor
                        :artist="trackArtist"
                        @update:artist="
                            (value) => {
                                updateArtist(value);
                            }
                        "
                        :album="trackAlbum"
                        @update:album="
                            (value) => {
                                updateAlbum(value);
                            }
                        "
                    ></ArtistLevelEditor>
                </CloakedPanel>

                <CloakedPanel
                    :revealFor="[trackBeatsPerMinute]"
                    class="level-item"
                >
                    <template #caption><span class="label">BPM</span></template>
                    <LabeledInput label="BPM">
                        <BpmEditor
                            class="input"
                            :modelValue="trackBeatsPerMinute"
                            @change="
                                updateBeatsPerMinute(
                                    Number.parseFloat($event.target.value),
                                )
                            "
                            placeholder="BPM"
                            title="BPM (Beats per minute)"
                        >
                        </BpmEditor>
                    </LabeledInput>
                </CloakedPanel>

                <!-- Pre-Roll (in time) (hide initially, as long as no cues are set) -->
                <CloakedPanel
                    v-if="hasCues || trackPreRoll"
                    :revealFor="[trackPreRoll]"
                    title="The custom pre-roll duration for this track in [seconds]"
                    class="level-item"
                >
                    <template #caption
                        ><span class="label">Pre-roll</span></template
                    >
                    <LabeledInput label="Pre-roll">
                        <TimeInput
                            class="has-text-right"
                            :modelValue="trackPreRoll"
                            @update:modelValue="(value:number|null) => updatePreRoll(value)"
                            size="9"
                        />
                    </LabeledInput>
                </CloakedPanel>
                <!-- Pre-Roll (in measures) (hide initially, as long as no cues are set) -->
                <CloakedPanel
                    v-if="
                        experimentalUseMeter &&
                        useMeasureNumbers &&
                        (hasCues || trackPreRoll)
                    "
                    :revealFor="[trackPreRoll]"
                    title="The custom pre-roll duration for this track in [measures]"
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
                            :modelValue="trackPreRoll"
                            @update:modelValue="(value:number|null) => updatePreRoll(value)"
                        >
                        </MetricalEditor>
                    </LabeledInput>
                </CloakedPanel>
            </template>
            <template v-else>
                <!-- Title -->
                <!-- The title is the only header element that should shrink (break on words) if necessary -->
                <div
                    class="level-item is-narrow is-flex-shrink-1"
                    @click="$emit('click')"
                    :class="{
                        'is-clickable': isTrackLoaded,
                        'has-cursor-not-allowed': !isTrackLoaded,
                    }"
                >
                    <p
                        class="title is-4"
                        :title="trackUrl"
                        :class="{ 'has-text-success': isActive }"
                    >
                        <TrackTitleName :name="trackName"></TrackTitleName>
                    </p>
                </div>

                <!-- Artist info (should not take too much width, and hide on small displays anyways)-->
                <div class="level-item is-hidden-mobile">
                    <p class="is-size-7">
                        <ArtistInfo
                            :album="trackAlbum"
                            :artist="trackArtist"
                            style="max-width: 25vw"
                        />
                    </p>
                </div>
            </template>
        </div>

        <!-- Right side -->
        <div class="level-right is-justify-content-flex-end">
            <div class="level-item">
                <!-- Slot for additional level items -->
                <slot name="left-end"></slot>
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
                    :trackId="trackId"
                    :trackName="trackName"
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
import { PropType, computed, inject, onBeforeMount, watch } from 'vue';
import PlaybackIndicator from '@/components/PlaybackIndicator.vue';
import MediaEdit from '@/components/MediaEdit.vue';
import CloakedPanel from '@/components/CloakedPanel.vue';
import TimeInput from '@/components/TimeInput.vue';
import MetricalEditor from '@/components/editor/MetricalEditor.vue';
import ArtistLevelEditor from '@/components/editor/ArtistLevelEditor.vue';
import BpmEditor from '@/components/editor/BpmEditor.vue';
import LabeledInput from '@/components/editor/LabeledInput.vue';
import StyledInput from '@/components/StyledInput.vue';
import TrackContextMenu from '@/components/context-menu/TrackContextMenu.vue';
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiAlert } from '@mdi/js';
import { TrackViewMode } from '@/store/compilation-types';
import ArtistInfo from '@/components/ArtistInfo.vue';
import TrackTitleName from './TrackTitleName.vue';
import { useAppStore } from '@/store/app';
import { ITimeSignature } from '@/code/music/ITimeSignature';
import {
    isPlayingInjectionKey,
    useMeasureNumbersInjectionKey,
} from './TrackInjectionKeys';
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';

const emit = defineEmits(['update:isExpanded', 'click']);

const props = defineProps({
    trackName: {
        type: String,
        required: true,
    },
    trackArtist: {
        type: String,
        required: true,
    },
    trackAlbum: {
        type: String,
        required: true,
    },
    trackPreRoll: {
        type: null as unknown as PropType<number | null>,
        required: false,
        default: null,
    },
    trackId: {
        type: String,
        required: true,
    },
    trackUrl: {
        type: String,
        required: true,
    },
    trackBeatsPerMinute: {
        type: null as unknown as PropType<number | null>,
        default: null,
    },
    trackTimeSignature: {
        type: null as unknown as PropType<ITimeSignature | null>,
        default: null,
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

    /** Whether this track has any cue at all */
    hasCues: {
        type: Boolean,
        required: true,
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

/** Flag to indicate whether the track is currently shared via the dialog.
 */
//const isSharing = ref(false);

/** Make sure for non-collapsible headers, they are reported initially as expanded once   */
onBeforeMount(() => {
    if (!props.canCollapse) {
        emit('update:isExpanded', true);
    }
});

const app = useAppStore();

const settings = useSettingsStore();
const { experimentalUseMeter } = storeToRefs(settings);

const useMeasureNumbers = inject(useMeasureNumbersInjectionKey);

/** Toggles the expansion state
 */
function toggleExpanded(): void {
    if (props.canCollapse) {
        const expanded = !props.isExpanded;
        console.debug(`TrackHeader::toggleExpanded:expanded:${expanded}`);
        emit('update:isExpanded', expanded);
    }
}

/** Updates the track name */
function updateName(name: string) {
    const trackId = props.trackId;
    const artist = props.trackArtist;
    const album = props.trackAlbum;

    app.updateTrackData(trackId, name, artist, album);
}

/** Updates the track artist */
function updateArtist(artist: string) {
    const trackId = props.trackId;
    const name = props.trackName;
    const album = props.trackAlbum;
    app.updateTrackData(trackId, name, artist, album);
}

/** Updates the track album */
function updateAlbum(album: string) {
    const trackId = props.trackId;
    const name = props.trackName;
    const artist = props.trackArtist;
    app.updateTrackData(trackId, name, artist, album);
}

/** Updates the track BPM */
function updateBeatsPerMinute(beatsPerMinute: number) {
    const trackId = props.trackId;
    app.updateBeatsPerMinute(trackId, beatsPerMinute);
}

/** Updates the track pre-roll */
function updatePreRoll(preRoll: number | null) {
    const trackId = props.trackId;
    app.updateTrackPreRoll(trackId, preRoll);
}

/** Handles changes in whether this is the active track.
         * @remarks When this ceases to be the active track, pause playback.
           This avoids having multiple tracks playing at the same time.
         */
watch(
    () => props.isActive,
    (isActive: boolean): void => {
        if (isActive) emit('update:isExpanded', isActive);
    },
    { immediate: true },
);

const isEditMode = computed(() => {
    return props.displayMode === TrackViewMode.Edit;
});

/** Flag to indicate whether this track's player is currently playing
 */
const isTrackPlaying = inject(isPlayingInjectionKey);
</script>
<style lang="scss" scoped>
/** Custom modification for the level in the context of a track.
* @remarks Allow the title text (on the left) to break between words, 
* and keep the context items (on the right) as close as reasonably possible */
.level {
    .level-left {
        word-break: break-word;
        /* This basis is set empirically to fit for the elements on the right */
        flex-basis: calc(100% - 120px);
    }

    .level-right {
        min-width: 0;

        /* Keep the right hand items (play indicator, expander) as small as possible */
        flex-basis: 0;

        /* These items should keep their size */
        .level-item {
            flex-shrink: 0;
            flex-grow: 0;
            text-align: right;
        }
    }
}
</style>
