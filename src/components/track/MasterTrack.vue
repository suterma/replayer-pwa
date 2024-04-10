<template>
    <div class="track is-together-print block" data-cy="track-master">
        <!-- Handle all track-relevant events here
        Note: A check for the active track is done in the handler methods. 
        A v-if here would work, but would register the events not in a useful order. -->
        <div data-v-9b701c96="">
            <!-- ReplayerEventHandler --><!-- this should get removed, but empty templates are not allowed -->
        </div>
        <div class="block">
            <!-- Each track is an item in a list and contains all the cues --><!-- Track header for editing, including artist info, expansion-toggler and adaptive spacing --><!-- NOTE: The @click handler on the header component only handles clicks on otherwise non-interactive elements --><!-- Header level with wrap for items in the left part.
         Using flex-start on the level, to cause the left and right parts to both 
         begin at the same, upper vertical position -->
            <div
                data-v-1ea64311=""
                data-v-9b701c96=""
                class="track-header level is-mobile is-align-items-flex-start"
            >
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
                <!-- Right side -->
                <div
                    data-v-1ea64311=""
                    class="level-right is-justify-content-flex-end"
                >
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
                        <PlaybackIndicator
                            :is-ready="!isAllPlaying && isAllTrackLoaded"
                            :is-track-playing="isAllPlaying"
                            :is-unloaded="!isAllTrackLoaded"
                            :is-unavailable="!isAllMediaAvailable"
                            data-cy="playback-indicator-all"
                        />
                    </div>
                    <!-- Slot for additional level items -->
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
import { provide, readonly } from 'vue';
import TimeDisplay from '@/components/TimeDisplay.vue';

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
</script>
