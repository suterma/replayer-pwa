<template>
    <div class="track is-together-print block" data-cy="track-master">
        <div class="block">
            <!-- Each track is an item in a list and contains all the cues --><!-- Track header for editing, including artist info, expansion-toggler and adaptive spacing --><!-- NOTE: The @click handler on the header component only handles clicks on otherwise non-interactive elements --><!-- Header level with wrap for items in the left part.
         Using flex-start on the level, to cause the left and right parts to both 
         begin at the same, upper vertical position -->
            <div class="track-header level is-mobile is-align-items-flex-start">
                <!-- Left side -->
                <div
                    class="level-left level-wrap is-justify-content-flex-start"
                >
                    <!-- Slot for prepending level items -->
                    <div class="level-item is-narrow">
                        <PlayPauseButton
                            :disabled="!isAllTrackLoaded"
                            :class="{
                                'is-success': isAllTrackLoaded,
                                'is-clickable': isAllTrackLoaded,
                                'has-cursor-not-allowed': !isAllTrackLoaded,
                            }"
                            :is-loading="isAnyFading"
                            data-cy="toggle-playback-master"
                            @click="multitrack.togglePlaybackAll()"
                        />

                        <!-- Routing controls only when mixable --><button
                            data-v-8441256a=""
                            data-v-9b701c96=""
                            class="button is-warning is-yellow is-inactive has-tooltip-arrow has-tooltip-multiline has-tooltip-text-centered has-tooltip-fade"
                            data-cy="solo"
                            data-tooltip="Listen solo"
                        >
                            S</button
                        ><button
                            data-v-9b701c96=""
                            class="button is-danger is-inactive has-tooltip-arrow has-tooltip-multiline has-tooltip-text-centered has-tooltip-fade"
                            data-cy="mute"
                            data-tooltip="Mute"
                        >
                            M
                        </button>
                        <div class="is-flex-shrink-1 ml-3 is-clickable">
                            <p class="title is-4" title="MASTER">
                                <span
                                    class="has-text-weight-light"
                                    data-cy="track-name-master"
                                    >MASTER</span
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
                            (position: number): void =>
                                multitrack.seekAllToSeconds(position)
                        "
                        @seek="
                            (seconds: number): void =>
                                multitrack.seekAll(seconds)
                        "
                    >
                    </PlayheadSlider>
                </div>
                <!-- Right side -->
                <div class="level-right">
                    <div class="level-item">
                        <button class="button is-nav is-indicator">
                            <TimeDisplay
                                :model-value="currentTime"
                                :sub-second-digits="1"
                            ></TimeDisplay>
                        </button>
                        <!-- Sync Time display -->
                        <!-- //TODO make this display a setting -->
                        <button
                            class="button is-nav"
                            @click="multitrack.updateCurrentTime()"
                        >
                            <span
                                class="is-minimum-7-characters is-family-monospace has-text-info"
                                title="Click to update time display"
                                >({{
                                    multitrack.getMultitrackPositionRange?.toFixed(
                                        6,
                                    )
                                }}s)</span
                            >
                        </button>
                        <button
                            class="button is-info"
                            title="Click to synch tracks"
                            @click="multitrack.syncTracks()"
                        >
                            Synch
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
                            :is-ready="!isAllPlaying && isAllTrackLoaded"
                            :is-track-playing="isAllPlaying"
                            :is-unloaded="!isAllTrackLoaded"
                            :is-unavailable="!isAllMediaAvailable"
                            data-cy="playback-indicator-all"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import PlaybackIndicator from '@/components/PlaybackIndicator.vue';
import PlayPauseButton from '@/components/buttons/PlayPauseButton.vue';
import { useMultitrackStore } from '@/store/multitrack';
import { storeToRefs } from 'pinia';
import { isPlayingInjectionKey } from './TrackInjectionKeys';
import { provide, readonly, ref } from 'vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import ToggleButton from '@/components/buttons/ToggleButton.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiRotateLeftVariant, mdiRotateRightVariant } from '@mdi/js';
import VueScrollTo from 'vue-scrollto';
import { useStyleTag } from '@vueuse/core';
import PlayheadSlider from '@/components/PlayheadSlider.vue';

/** Displays a master track div with a title, and controls for it.
 * @displayName MasterTrack
 */

// --- Multitrack ---
const multitrack = useMultitrackStore();
const {
    isAllTrackLoaded,
    isAllTrackMuted,
    isAllTrackSoloed,
    isAllPlaying,
    isAllPaused,
    isAllMediaAvailable,
    isAnyFading,
    allTrackDuration,
    currentTime,
} = storeToRefs(multitrack);

provide(isPlayingInjectionKey, readonly(isAllPlaying));

// --- vertical display ---

const {
    load,
    unload,
    /** Whether to show the track in a vertical orientation */
    isLoaded: showVertical,
} = useStyleTag(
    `
.tracks {
    /* background-color: darkslategray; */
    max-width: calc(100vh - 200px);
    min-width: calc(100vh - 200px);
    transform: rotate(-90deg) translate(calc(-100vh + 200px), 0);
    transform-origin: top left;
    overflow-y: auto;
}
/** Rotate knobs back to their upright position */
.tracks .track .is-knob {
    transform: rotate(+90deg);
}

/** Rotate buttons back to their upright position */
.tracks .track .button {
    transform: rotate(+90deg);
    width: 2.5em;
}
`,
    { /*Do not load the style initially*/ immediate: false },
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
</script>
