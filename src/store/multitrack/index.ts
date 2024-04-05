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
        audio.mediaHandlers.forEach((handler) => {
            handler.seekTo(position);
        });
    }

    /** Seeks all track by the given timespan in [seconds]
     */
    function seekAll(seconds: number) {
        audio.mediaHandlers.forEach((handler) => {
            handler.seek(seconds);
        });
    }

    /** Forcibly synchronizes playback of all tracks
     */
    function synchTracks() {
        const targetTime = currentTime.value;
        seekAllToSeconds(targetTime);
    }

    /** Starts synchronous playback of all tracks
     */
    function togglePlaybackAll() {
        // Decide whether to play or pause all
        if (isAllPaused.value) {
            synchTracks();
            audio.mediaHandlers.forEach((handler) => {
                handler.play();
            });
        } else {
            audio.mediaHandlers.forEach((handler) => {
                handler.pause();
            });
            synchTracks();
        }
    }

    /** Whether all tracks have their media resource loaded */
    const isAllTrackLoaded = ref(false);

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
    const allTrackDuration = ref(NaN);

    /** Gets the playback position (current time) of all tracks
     * @remarks The average track position is used
     */
    const currentTime = ref(NaN);

    /** Gets the range of the track positions of all tracks from the last getMultitrackPosition call
     */
    const getMultitrackPositionRange = ref(NaN);

    // --- watch the handlers ---

    //TODO handle all other events like these, then clean up the mess

    const _pausedSubscriptons: Subscription[] = new Array<Subscription>();
    const _fadingSubscriptons: Subscription[] = new Array<Subscription>();
    const _canPlaySubscriptons: Subscription[] = new Array<Subscription>();
    const _durationSubscriptons: Subscription[] = new Array<Subscription>();
    const _positionSubscriptons: Subscription[] = new Array<Subscription>();

    /** Watch the media handler set, and react on their relevant events */
    watch(
        () => audio.mediaHandlers,
        (mediaHandlers) => {
            console.debug(
                `Multitrack::watch:mediaHandlers.size:${mediaHandlers?.size}`,
            );

            //NOTE: The old and new media handlers are the same object, as
            //mentioned here: https://github.com/vuejs/vue/issues/2164#issuecomment-2038959990

            // Get the current handler id's (for comparison with subscription names)
            const handlerIds = new Set<string>();
            mediaHandlers.forEach((handler) => {
                handlerIds.add(handler.id);
            });
            // Remove all subscriptions that are not in the current set
            _pausedSubscriptons.forEach((subscription) => {
                if (subscription.name && !handlerIds.has(subscription.name)) {
                    subscription.cancel();
                }
            });
            _fadingSubscriptons.forEach((subscription) => {
                if (subscription.name && !handlerIds.has(subscription.name)) {
                    subscription.cancel();
                }
            });
            _canPlaySubscriptons.forEach((subscription) => {
                if (subscription.name && !handlerIds.has(subscription.name)) {
                    subscription.cancel();
                }
            });
            _durationSubscriptons.forEach((subscription) => {
                if (subscription.name && !handlerIds.has(subscription.name)) {
                    subscription.cancel();
                }
            });
            _positionSubscriptons.forEach((subscription) => {
                if (subscription.name && !handlerIds.has(subscription.name)) {
                    subscription.cancel();
                }
            });

            // Add missing subscriptions
            mediaHandlers.forEach((handler) => {
                if (!_pausedSubscriptons.some((s) => s.name === handler.id)) {
                    _pausedSubscriptons.push(
                        handler.onPausedChanged.subscribe(updatePauseChanged, {
                            name: handler.id,
                        }),
                    );
                }
                if (!_fadingSubscriptons.some((s) => s.name === handler.id)) {
                    _fadingSubscriptons.push(
                        handler.fader.onFadingChanged.subscribe(
                            updateFadingChanged,
                            {
                                name: handler.id,
                            },
                        ),
                    );
                }
                if (!_canPlaySubscriptons.some((s) => s.name === handler.id)) {
                    _canPlaySubscriptons.push(
                        handler.onCanPlay.subscribe(updateCanPlayChanged, {
                            name: handler.id,
                        }),
                    );
                }
                if (!_durationSubscriptons.some((s) => s.name === handler.id)) {
                    _durationSubscriptons.push(
                        handler.onDurationChanged.subscribe(
                            updateDurationChanged,
                            {
                                name: handler.id,
                            },
                        ),
                    );
                }
                if (!_positionSubscriptons.some((s) => s.name === handler.id)) {
                    _positionSubscriptons.push(
                        handler.onCurrentTimeChanged.subscribe(
                            updateCurrentTimeChanged,
                            {
                                name: handler.id,
                            },
                        ),
                    );
                }
            });
        },
        {
            immediate: true /* to handle it right after mount time */,
            deep: true /** Also watch for updates of mediaHandlers's entry set */,
        },
    );

    function updatePauseChanged(paused: boolean) {
        if (paused) {
            isAllPlaying.value = false;
            for (const media of audio.mediaHandlers) {
                if (!media.paused) {
                    isAllPaused.value = false;
                    return;
                }
            }
            isAllPaused.value = true;
        } else {
            isAllPaused.value = false;
            for (const media of audio.mediaHandlers) {
                if (media.paused) {
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

    function updateCanPlayChanged() {
        for (const media of audio.mediaHandlers) {
            if (!media.canPlay) {
                isAllTrackLoaded.value = false;
                return;
            }
        }
        isAllTrackLoaded.value = true;
    }

    function updateDurationChanged() {
        let duration = NaN;
        audio.mediaHandlers.forEach((handler) => {
            if (
                /* First finite number? */
                (Number.isFinite(handler.duration) && Number.isNaN(duration)) ||
                handler.duration < duration
            ) {
                duration = handler.duration;
            }
        });
        allTrackDuration.value = duration;
    }

    //TODO maybe throttle this to 30 FPS or so
    function updateCurrentTimeChanged() {
        const times = new Array<number>();
        audio.mediaHandlers.forEach((handler) => {
            if (Number.isFinite(handler.currentTime)) {
                times.push(handler.currentTime);
            }
        });
        if (times.length === 0) {
            currentTime.value = NaN;
        }
        const min = Math.min(...times);
        const max = Math.max(...times);
        getMultitrackPositionRange.value = max - min;
        const sum = times.reduce((a, c) => a + c, 0);
        const avg = sum / times.length;
        currentTime.value = avg;
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
        allTrackDuration,
        currentTime,
        getMultitrackPositionRange,
    };
});
