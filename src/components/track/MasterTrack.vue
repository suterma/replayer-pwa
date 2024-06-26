<template>
    <div class="track is-together-print block" data-cy="track-master">
        <div class="block">
            <!-- Each track is an item in a list and contains all the cues --><!-- Track header for editing, including artist info, expansion-toggler and adaptive spacing --><!-- NOTE: The @click handler on the header component only handles clicks on otherwise non-interactive elements --><!-- Header level with wrap for items in the left part.
         Using flex-start on the level, to cause the left and right parts to both 
         begin at the same, upper vertical position -->
            <div class="track-header level">
                <!-- Left side -->
                <div class="level-left level-wrap">
                    <!-- Slot for prepending level items -->
                    <div class="level-item is-narrow is-justify-content-left">
                        <PlayPauseButton
                            :disabled="!canAllPlay"
                            :class="{
                                'is-success': canAllPlay,
                                'is-clickable': canAllPlay,
                                'has-cursor-not-allowed': !canAllPlay,
                            }"
                            :is-loading="isAnyFading"
                            data-cy="toggle-playback-master"
                            @click="multitrack.togglePlaybackAll()"
                        />

                        <!-- Routing controls -->
                        <SoloButton
                            :disabled="!canAllPlay"
                            :is-soloed="isAllSoloed"
                            data-cy="solo-master"
                            @click="multitrack.toggleAllSolo()"
                        />
                        <MuteButton
                            :disabled="!canAllPlay"
                            :is-muted="isAllMuted"
                            data-cy="mute-master"
                            @click="multitrack.toggleAllMute()"
                        />
                        <div class="is-flex-shrink-1 ml-3 is-clickable">
                            <p class="title is-4" :title="name">
                                <span
                                    class="has-text-weight-light"
                                    data-cy="track-name-master"
                                    >{{ name }}</span
                                >
                            </p>
                        </div>
                    </div>
                </div>

                <!-- A central level item. Margins are set to provide nice-looking spacing at all widths -->
                <div class="level-item mt-4-mobile">
                    <PlayheadSlider
                        class="is-fullwidth"
                        :model-value="currentTime"
                        :track-duration="allTrackDuration"
                        @update:model-value="
                            (position: number): Promise<void> =>
                                multitrack.seekAllToSeconds(position)
                        "
                        @seek="
                            (seconds: number): Promise<void> =>
                                multitrack.seekAll(seconds)
                        "
                    >
                    </PlayheadSlider>
                </div>
                <!-- Right side -->
                <div class="level-right">
                    <div class="level-item is-justify-content-right">
                        <!-- Updatedable time spreading display -->
                        <button
                            class="button is-nav"
                            @click="multitrack.updateCurrentTime()"
                        >
                            <span
                                class="is-minimum-7-characters is-family-monospace has-text-info"
                                title="Click to update time display"
                                >({{
                                    multitrack.timeSpreading?.toFixed(6)
                                }}s)</span
                            >
                        </button>
                        <button
                            v-tooltip.top="
                                `Spreading: ${(multitrack.timeSpreading * 1000).toFixed(0)} ms (${spreadingInfo})`
                            "
                            class="button is-info is-outlined"
                            title="Click to synch tracks"
                            @click="multitrack.syncTracks()"
                        >
                            Sync

                            <CircularProgress
                                v-if="Number.isFinite(multitrack.timeSpreading)"
                                class="ml-2 is-info"
                                :class="spreadingClass"
                                :value="
                                    multitrack.timeSpreading *
                                    1000 *
                                    3.33 /* 15ms equals 50% */
                                "
                            />
                            <BaseIcon
                                v-else
                                class="ml-2 has-text-black"
                                :path="mdiCircle"
                            />
                        </button>

                        <ToggleButton
                            class="button is-primary"
                            :class="{
                                'is-inactive': !showVertical,
                            }"
                            :is-engaged="showVertical"
                            engaged-label="show horizontal tracks"
                            disengaged-label="show vertical tracks"
                            @click="toggleVertical($event)"
                        >
                            <BaseIcon
                                v-if="!showVertical"
                                :path="mdiRotateLeftVariant"
                            />
                            <BaseIcon
                                v-else
                                :path="mdiRotateRightVariant"
                                :style="{
                                    transform: 'rotate(' + 90 + 'deg)',
                                }"
                            />
                        </ToggleButton>
                        <PlaybackIndicator
                            :is-ready="!isAllPlaying && canAllPlay"
                            :is-track-playing="isAllPlaying"
                            :is-unloaded="!canAllPlay"
                            :is-unavailable="!isAllMediaAvailable"
                            data-cy="playback-indicator-all"
                            @click="updateTracksCss()"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import PlaybackIndicator from '@/components/indicators/PlaybackIndicator.vue';
import CircularProgress from '@/components/indicators/CircularProgress.vue';
import PlayPauseButton from '@/components/buttons/PlayPauseButton.vue';
import { useMultitrackStore } from '@/store/multitrack';
import { Multitrack } from '@/store/multitrack/Multitrack';
import { storeToRefs } from 'pinia';
import { isPlayingInjectionKey } from './TrackInjectionKeys';
import { provide, readonly, computed, ref, inject } from 'vue';
import { useElementSize } from '@vueuse/core';
import ToggleButton from '@/components/buttons/ToggleButton.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import {
    mdiRotateLeftVariant,
    mdiRotateRightVariant,
    mdiCircle,
} from '@mdi/js';
import VueScrollTo from 'vue-scrollto';
import { useStyleTag, refDebounced } from '@vueuse/core';
import PlayheadSlider from '@/components/PlayheadSlider.vue';
import SoloButton from '../buttons/SoloButton.vue';
import MuteButton from '../buttons/MuteButton.vue';

/** Displays a master track div with a title, and controls for it.
 * @displayName MasterTrack
 */
const props = defineProps({
    /** The name to use for the master track
     */
    name: {
        type: String,
        required: false,
    },
});

// --- Multitrack ---

console.debug(`MasterTrack::useMultitrackStore`);
const multitrack = useMultitrackStore();
const {
    canAllPlay,
    isAllMuted,
    isAllSoloed,
    isAllPlaying,
    /*isAllPaused,*/
    isAllMediaAvailable,
    isAnyFading,
    allTrackDuration,
    currentTime,
} = storeToRefs(multitrack);

provide(isPlayingInjectionKey, readonly(isAllPlaying));

// --- vertical with adapted bottom spacing ---

const mediaPlayerPanel = document.getElementById('media-player-panel');
const compilationHeader = document.getElementById('compilation-header');
const { height: mediaPlayerPanelHeight } = useElementSize(mediaPlayerPanel);
const { height: compilationHeaderHeight } = useElementSize(compilationHeader);

/** A computed compensation height, using a fixed value as a fallback.
 * @devdoc Some devices, notably older iOS devices can not get the panel
 * height (equals zero), thus a useful default is assumed instead.
 */
const mediaPlayerPanelComputedHeight = computed(() => {
    return mediaPlayerPanelHeight.value && compilationHeaderHeight.value
        ? mediaPlayerPanelHeight.value +
              compilationHeaderHeight.value +
              80 /* additional fixed spacing to compensate for various 
              media width-related margins and paddings */
        : 205 /*empirically determined useful max height*/;
});

/** The body height compensation for the fixed navbar.
 * @remark Debounced to prevent excess updates
 * @devdoc Debouncing also solves a update loop error
 */
const navbarCompensationHeight = refDebounced(
    mediaPlayerPanelComputedHeight,
    300 /*replayer-transition-duration*/,
);

function toggleVertical(event: Event): void {
    if (showVertical.value) {
        unload();
    } else {
        load();
    }
    if (showVertical.value) {
        VueScrollTo.scrollTo(event.target, {
            /** Always scroll, make it on top of the view */
            force: true,
            /** empirical value */
            offset: 0,
            /** Avoid interference with the key press overlay */
            cancelable: false,
        });
    }
}

function updateTracksCss() {
    css.value = tracksCss.value;
}

// --- vertical display ---

const tracksCss = computed(() => {
    return `
        .tracks {
            /* background-color: darkslategray; */
            max-width: calc(100vh - ${navbarCompensationHeight.value}px);
            min-width: calc(100vh - ${navbarCompensationHeight.value}px);
            transform: rotate(-90deg) translate(calc(-100vh + ${navbarCompensationHeight.value}px), 0);
            transform-origin: top left;
            /*overflow-y: auto;*/
        }

        /** Rotate buttons back to their upright position
         * @remarks This includes the volume knob (which is technically a button)
         */
        .tracks .track .button {
            transform: rotate(+90deg);
            width: 2.5em;
        }`;
});

const {
    load,
    unload,
    css,
    /** Whether to show the track in a vertical orientation */
    isLoaded: showVertical,
} = useStyleTag(tracksCss, {
    /*Do not load the style initially*/ immediate: false,
});

// --- spreading info ---

const spreadingClass = computed(() => {
    if (multitrack.timeSpreading > Multitrack.MaxTrackTimeDeviation * 2) {
        return 'is-danger'; /* bad */
    }
    if (multitrack.timeSpreading > Multitrack.MaxTrackTimeDeviation) {
        return 'is-warning'; /* acceptable */
    }
    return 'is-info'; /* good */
});

const spreadingInfo = computed(() => {
    if (multitrack.timeSpreading > Multitrack.MaxTrackTimeDeviation * 2) {
        return 'bad'; /* bad */
    }
    if (multitrack.timeSpreading > Multitrack.MaxTrackTimeDeviation) {
        return 'acceptable'; /* acceptable */
    }
    return 'good'; /* good */
});
</script>
