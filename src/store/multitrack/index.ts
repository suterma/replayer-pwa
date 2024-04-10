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
import { Reading } from './Reading';
import { useThrottleFn } from '@vueuse/core';

/** A store for multitrack audio-related global state
 * @remarks This uses and extends the audio store, specifically for a
 * multitrack playback scenario
 */
export const useMultitrackStore = defineStore(Store.Multitrack, () => {
    /** A converstion ratio
     * @remarks Used for converting the performance timestamps, which are
     * in [milliseconds] to [seconds]
     */
    const millisecondsPerSecond = 1000;

    const testSkewMilliseconds = 50; //50;

    /** The maximum track timing deviation allowed, in [seconds],
     * before an auto-sync operation executed
     * @remarks The value is chosen to keep sync errors mostly inaudible
     * @remarks See https://sengpielaudio.com/calculator-soundpath.htm for
     * details.
     * A value of 15 milliseconds represents a distance of 5 meters at room temperature.
     * This value might be considered typical for a small stage or rehearsal romm.
     */
    const maxTrackTimeDeviation = 0.015;

    /** A predetermined compensation offset for the sync operation
     * @remarks This value is updated each time;
     * the initial value was empirically determined
     */
    let synchPlaybackOffset = 0.105;

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
     * @remarks  For any currently playing media,
     * corrects for the time passed since the origin of the method
     */
    function seekAllToSeconds(position: number) {
        const originTime = performance.now();
        audio.mediaHandlers.forEach((handler) => {
            let offset = 0;
            if (!handler.paused) {
                offset =
                    (performance.now() - originTime) / millisecondsPerSecond;
            }
            handler.seekTo(position + offset);
            console.debug(`Multitrack::seekAllToSeconds:offset:${offset}`);

            //TODO test
            syncWait(testSkewMilliseconds);
        });
    }

    /** Seeks all track by the given timespan in [seconds]
     */
    function seekAll(seconds: number) {
        audio.mediaHandlers.forEach((handler) => {
            handler.seek(seconds);

            //TODO test
            syncWait(testSkewMilliseconds);
        });
    }

    /** Updates the common current time indication for all tracks and,
     *  during continued playback, triggers a sync if the time range
     * is high
     * @remarks Implements a throttling, with timeout, to keep the system load low and outside the playback start/stop/fading events
     */
    const syncOnPlayback = useThrottleFn(() => {
        const { avg, range } = updateCurrentTime();
        return;
        //TODO test currently do not use
        //console.debug(`Multitrack::autoSync:avg:${avg}:range:${range}`);

        if (isAllPlaying.value === true && isAnyFading.value === false) {
            if (range > maxTrackTimeDeviation) {
                //synch tracks outside the possible UI event loop
                setTimeout(() => {
                    if (
                        isAllPlaying.value === true &&
                        isAnyFading.value === false
                    ) {
                        syncTracks();
                    }
                }, 1);
            }
        }
    }, 3000);

    /** Forcibly synchronizes playback of all tracks
     * @remarks Maintains an offset to compensate for the runtime of this method
     */

    function syncTracks() {
        const originTime = performance.now();
        // get up-to date value
        const { avg } = updateCurrentTime();
        let targetTime = avg;
        targetTime += synchPlaybackOffset;
        seekAllToSeconds(targetTime);

        // update the synch-offset with a very primitive running average
        synchPlaybackOffset =
            (synchPlaybackOffset + (performance.now() - originTime)) /
            (2 * millisecondsPerSecond);

        console.debug(
            `Multitrack::synchTracks:targetTime:${targetTime}:synchPlaybackOffset:${synchPlaybackOffset}`,
        );
    }

    /** Starts synchronous playback of all tracks
     * @remarks  For any newly playing media,
     * corrects for the time passed since the origin of the method
     * @remarks Also, after the operation ended, executes an additional synch
     */
    function togglePlaybackAll() {
        // if (afterFadeSynchHandle) {
        //     clearTimeout(afterFadeSynchHandle);
        //     afterFadeSynchHandle = null;
        // }
        //let maxFadeTime = 0;
        // Decide whether to play or pause all
        if (isAllPaused.value) {
            const originTime = performance.now();
            audio.mediaHandlers.forEach(async (handler) => {
                const offset =
                    (performance.now() - originTime) / millisecondsPerSecond;

                console.debug(`Multitrack::togglePlaybackAll:offset:${offset}`);
                handler.play();
                // maxFadeTime = Math.max(
                //     maxFadeTime,
                //     handler.fader.fadeInDuration,
                // );
                //TODO test
                //syncWait(testSkewMilliseconds);

                ..//TODO                move all stuff from the compilation to the master track, then (optionally) teleport the master track to the playback widget area
            });
        } else {
            audio.mediaHandlers.forEach((handler) => {
                handler.pause();
                // maxFadeTime = Math.max(
                //     maxFadeTime,
                //     handler.fader.fadeOutDuration,
                // );
                //TODO test
                syncWait(testSkewMilliseconds);
            });
        }
        //afterFadeSynchHandle = setTimeout(syncOnPlayback, maxFadeTime);
    }

    /** A handle to the current synch after a play/pause operation.
     * Will be set to null when cancelled, to indicate the cancel status. */
    //let afterFadeSynchHandle: NodeJS.Timeout | null = null;

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

    // --- subscribe to the events of the handlers ---

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

    // --- handle the subscriptions ---

    // /** Sync after playback stops */
    // watch(
    //     () => isAllPaused,
    //     (paused) => {
    //         if (paused) {
    //             syncTracks();
    //         }
    //     },
    //     {
    //         immediate: true /* to handle it right after mount time */,
    //     },
    // );

    // /** Sync after playback start, after fade-in has finised */
    // watch(
    //     () => isAnyFading,
    //     (isAnyFading) => {
    //         if (!isAnyFading) {
    //             syncTracks();
    //         }
    //     },
    //     {
    //         immediate: true /* to handle it right after mount time */,
    //     },
    // );

    /**
     * @devdoc This method is optimized for early termination
     */
    function updatePauseChanged(paused: boolean) {
        if (paused) {
            isAllPlaying.value = false;
            for (const media of audio.mediaHandlers) {
                if (!media.paused) {
                    isAllPaused.value = false;
                    return; // as early as possible
                }
            }
            isAllPaused.value = true;
            syncTracks(); // immediately
        } else {
            isAllPaused.value = false;
            for (const media of audio.mediaHandlers) {
                if (media.paused) {
                    isAllPlaying.value = false;
                    return; // as early as possible
                }
            }
            isAllPlaying.value = true;
            //syncOnPlayback();
        }
    }

    /**
     * @devdoc This method is optimized for early termination
     */
    function updateFadingChanged(fading: FadingMode) {
        if (fading === FadingMode.FadeIn || fading === FadingMode.FadeOut) {
            isAnyFading.value = true;
            return; // as early as possible
        }
        audio.mediaHandlers.forEach((handler) => {
            if (handler.fader.fading) {
                isAnyFading.value = true;
                return; // as early as possible
            }
        });
        isAnyFading.value = false;
    }

    /**
     * @devdoc All handlers need to be checked every time
     */
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

    /** Updates the common current time indication for all tracks.
     * @remarks Also triggers a sync operation
     * @devdoc To keep system load low, just use a simple pass-thru
     */
    function updateCurrentTimeChanged(time: number) {
        currentTime.value = time;
        //console.debug(`Multitrack::updateCurrentTimeChanged:time:${time}`);
        //syncOnPlayback();
    }

    /** Updates the multitrack current time, based on all tracks.
     * @remarks  For any currently playing media,
     * this method corrects for the time passed from the first reading until all
     * readings have been gathered.
     * @returns The average and range value of the multitrack current time in [seconds]
     */
    function updateCurrentTime(): { avg: number; range: number } {
        const readings = new Array<Reading<number>>();
        audio.mediaHandlers.forEach((handler) => {
            let timestamp = performance.now() / millisecondsPerSecond;
            const trackCurrentTime = handler.currentTime;
            if (handler.paused) {
                // indicate omission of timestamp skew correction, because
                // this handler is not playing anyway
                timestamp = NaN;
            }
            if (Number.isFinite(trackCurrentTime)) {
                readings.push(new Reading(timestamp, trackCurrentTime));

                //TODO test
                syncWait(testSkewMilliseconds);
            }
        });
        if (readings.length === 0) {
            currentTime.value = NaN;
            return { avg: NaN, range: NaN };
        } else {
            // unskew the the readings
            console.debug('Multitrack:updateCurrentTime:readings:', readings);
            const times = new Array<number>(readings.length);
            let index = 0;
            const now = performance.now() / millisecondsPerSecond;
            readings.forEach((reading) => {
                if (!Number.isNaN(reading.Timestamp)) {
                    times[index++] = reading.Value + (now - reading.Timestamp);
                } else {
                    times[index++] = reading.Value;
                }
            });

            console.debug('Multitrack:updateCurrentTime:times:', times);

            // The times now are most truthful readings with regard to the current moment in time
            // Now provide the average current time as fast as possible
            const sum = times.reduce((a, c) => a + c, 0);
            const avg = sum / times.length;
            currentTime.value = avg;

            const min = Math.min(...times);
            const max = Math.max(...times);
            const range = max - min;
            getMultitrackPositionRange.value = range;

            return { avg, range };
        }
    }

    //TODO for test, later remove
    const syncWait = (ms: number) => {
        const end = Date.now() + ms;
        while (Date.now() < end) continue;
    };

    return {
        toggleSolo,
        toggleMute,
        seekAllToSeconds,
        seekAll,
        syncTracks,
        /** Updates the current time, with an average from all currently playing tracks.
         * Also calculates the min-max range of the times.
         */
        updateCurrentTime,
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
