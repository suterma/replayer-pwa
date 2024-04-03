/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import { defineStore, storeToRefs } from 'pinia';
import {
    type ShallowRef,
    computed,
    ref,
    shallowRef,
    readonly,
    watch,
    watchEffect,
} from 'vue';
import { Store } from '..';
import { useAudioStore } from '../audio';
import { Subscription } from 'sub-events';

/** A store for multitrack audio-related global state
 * @remarks This uses and extends the audio store, specifically for a
 * multitrack playback scenario
 */
export const useMultitrackStore = defineStore(Store.Multitrack, () => {
    const audio = useAudioStore();
    const { mediaHandlers } = storeToRefs(audio);

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
            mediaHandlers.value.forEach((handler) => {
                handler.play();
            });
            //audio.mediaHandlers.every((handler) => handler.togglePlayback());
        } else {
            mediaHandlers.value.forEach((handler) => {
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

    /** Whether the media resources for tracks are available */
    const isAllMediaAvailable = computed(() =>
        mediaHandlers.value.every((handler) => handler.mediaSourceUrl),
    );

    /** Gets the track duration of all tracks
     * @remarks The minimum track duration is used
     */
    const getAllTrackDuration = computed((): number => {
        if (!mediaHandlers.value.length) {
            return NaN;
        }
        return mediaHandlers.value.reduce((prev, curr) =>
            prev.duration < curr.duration ? prev : curr,
        ).currentTime;
    });

    /** Gets the track position of all tracks
     * @remarks The average track position is used
     */
    const getMultitrackPosition = computed((): number => {
        if (!mediaHandlers.value.length) {
            return NaN;
        }
        return (
            mediaHandlers.value.reduce(
                (total, next) => total + next.currentTime,
                0,
            ) / mediaHandlers.value.length
        );
    });

    /** Gets the range of the track positions of all tracks from the last getMultitrackPosition call
     */
    const getMultitrackPositionRange = computed((): number => {
        if (!mediaHandlers.value.length) {
            return NaN;
        }
        const minimum = mediaHandlers.value.reduce((prev, curr) =>
            prev.currentTime < curr.currentTime ? prev : curr,
        ).currentTime;
        const maximum: number = mediaHandlers.value.reduce((prev, curr) =>
            prev.currentTime > curr.currentTime ? prev : curr,
        ).currentTime;
        return maximum - minimum;
    });

    // --- watch the handlers ---

    ...//TODO handle all other events like these, then clean up the mess

    let _pausedSubscriptons: Subscription[] = new Array<Subscription>();
    let _fadingSubscriptons: Subscription[] = new Array<Subscription>();

    /** Watch the media handler set, and react on their relevant events */
    watch(
        () => mediaHandlers.value.length,
        () => {
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

    function updatePauseChanged() {
        isAllPlaying.value = mediaHandlers.value.every(
            (handler) => !handler.paused,
        );
        isAllPaused.value = mediaHandlers.value.every(
            (handler) => handler.paused,
        );
    }

    function updateFadingChanged() {
        isAnyFading.value = mediaHandlers.value.some(
            (handler) => handler.fader.fading,
        );
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
