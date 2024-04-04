/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { Store } from '..';
import { useAudioStore } from '../audio';
import { Subscription } from 'sub-events';
import { FadingMode } from '@/code/media/IAudioFader';

/** A store for multitrack audio-related global state
 * @remarks This uses and extends the audio store, specifically for a
 * multitrack playback scenario
 */
export const useMultitrackStore = defineStore(Store.Multitrack, () => {
    const audio = useAudioStore();

    /** Toggles the solo state for all tracks
     */
    function toggleSolo() {
        //TODO
    }

    /** Toggles the mute state for all tracks
     */
    function toggleMute() {
        //TODO
    }

    /** Seeks all track to the given position
     */
    function seekAllToSeconds(position: number) {
        //TODO
    }

    /** Seeks all track by the given timespan in [seconds]
     */
    function seekAll(seconds: number) {
        //TODO
    }

    /** Forcibly synchronizes playback of all tracks
     */
    function synchTracks() {
        //TODO
    }

    /** Starts synchronous playback of all tracks
     */
    function togglePlaybackAll() {
        // Decide whether to play or pause all
        if (isAllPaused.value) {
            synchTracks(); //then
            audio.mediaHandlers.forEach((handler) => {
                handler.play();
            });
            //audio.mediaHandlers.every((handler) => handler.togglePlayback());
        } else {
            audio.mediaHandlers.forEach((handler) => {
                handler.pause();
            });

            //            audio.mediaHandlers.every((handler) => handler.pause());
            //then
            synchTracks();
        }
    }

    /** Whether all tracks have their media resource loaded */
    const isAllTrackLoaded = ref(true);

    /** Whether all tracks are soloed */
    const isAllTrackSoloed = computed(() => {
        return false; //TODO
    });

    /** Whether all tracks are muted */
    const isAllTrackMuted = computed(() => {
        return false; //TODO
    });

    /** Whether all tracks are playing */
    const isAllPlaying = ref(false);

    /** Whether all tracks are paused */
    const isAllPaused = ref(true);

    /** Whether any track is fading */
    //    const isAnyFading = ref(false);
    const isAnyFading = ref(false);

    /** Whether the media resources for all tracks are available */
    const isAllMediaAvailable = computed(() => {
        audio.mediaHandlers.forEach((handler) => {
            if (!handler.mediaSourceUrl) {
                return false;
            }
        });
        return true;
    });

    /** Gets the track duration of all tracks
     * @remarks The minimum track duration is used
     */
    const getAllTrackDuration = computed((): number => {
        let duration = NaN;
        audio.mediaHandlers.forEach((handler) => {
            if (handler.duration < duration) {
                duration = handler.duration;
            }
        });

        return duration;
    });

    /** Gets the playback position (current time) of all tracks
     * @remarks The average track position is used
     */
    const getMultitrackPosition = computed((): number => {
        let currentTime = 0;
        let count = 0;
        audio.mediaHandlers.forEach((handler) => {
            currentTime += handler.currentTime;
            count++;
        });

        if (count === 0) {
            return NaN;
        }

        return currentTime / count;
    });

    /** Gets the range of the track positions of all tracks from the last getMultitrackPosition call
     */
    const getMultitrackPositionRange = computed((): number => {
        //TODO do not use this average
        let currentTime = 0;
        let count = 0;
        audio.mediaHandlers.forEach((handler) => {
            currentTime += handler.currentTime;
            count++;
        });

        if (count === 0) {
            return NaN;
        }

        return currentTime / count;
    });

    // --- watch the handlers ---

    //TODO handle all other events like these, then clean up the mess

    const _pausedSubscriptons: Subscription[] = new Array<Subscription>();
    const _fadingSubscriptons: Subscription[] = new Array<Subscription>();

    /** Watch the media handler set, and react on their relevant events */
    watch(
        () => audio.mediaHandlers.size,
        () => {
            console.debug(
                'Multitrack::watch:mediaHandlers.size',
                audio.mediaHandlers.size,
            );
            //TODO later optimize these subscriptions
            _pausedSubscriptons.forEach((subscription) => {
                subscription.cancel();
            });
            _fadingSubscriptons.forEach((subscription) => {
                subscription.cancel();
            });

            audio.mediaHandlers.forEach((handler) => {
                _pausedSubscriptons.push(
                    handler.onPausedChanged.subscribe(updatePauseChanged),
                );
                _fadingSubscriptons.push(
                    handler.fader.onFadingChanged.subscribe(
                        updateFadingChanged,
                    ),
                );
            });
        },
        {
            immediate: true /* to handle it at least once after mount time */,
            deep: false,
        },
    );

    function updatePauseChanged(paused: boolean) {
        if (paused) {
            isAllPlaying.value = false;
            for (const [, value] of audio.mediaHandlers) {
                if (!value.paused) {
                    isAllPaused.value = false;
                    return;
                }
            }
            isAllPaused.value = true;
        } else {
            isAllPaused.value = false;
            for (const [, value] of audio.mediaHandlers) {
                if (value.paused) {
                    isAllPlaying.value = false;
                    return;
                }
            }
            isAllPlaying.value = true;
        }
    }

    function updateFadingChanged(fading: FadingMode) {
        if (fading != FadingMode.None) {
            isAnyFading.value = true;
            return;
        }
        audio.mediaHandlers.forEach((handler) => {
            if (handler.fader.fading) {
                isAllPlaying.value = true;
                return;
            }
        });
        isAnyFading.value = false;
    }

    return {
        toggleSolo,
        toggleMute,
        seekAllToSeconds,
        seekAll,
        synchTracks,
        togglePlaybackAll,
        isAllTrackLoaded,
        isAllTrackSoloed,
        isAllTrackMuted,
        isAllPlaying,
        isAllPaused,
        isAnyFading,
        isAllMediaAvailable,
        getAllTrackDuration,
        getMultitrackPosition,
        getMultitrackPositionRange,
    };
});
