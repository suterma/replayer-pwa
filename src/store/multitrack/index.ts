/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import { defineStore } from 'pinia';
import { computed, nextTick, ref, watch } from 'vue';
import { Store } from '..';
import { useAudioStore } from '../audio';
import { Subscription } from 'sub-events';
import { FadingMode } from '@/code/media/IAudioFader';
import { Reading } from './Reading';

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

    /** A predetermined compensation offset, in [seconds], for the sync operation
     * @remarks This value is updated each time;
     * the initial value was empirically determined
     */
    let synchPlaybackOffset = 0.06;

    /** A fixed correction for the compensation offset, in [seconds]
     * @remarks This value was empirically determined on Chromium on Ubuntu
     * to allow for a smooth sync process that keeps playback at the most
     * continuous pace.
     */
    const synchPlaybackOffsetCorrection = 0.014;

    const audio = useAudioStore();

    /** Toggles the solo state for all tracks
     */
    function toggleAllSolo() {
        const isSoloed = !isAllSoloed.value;
        isAllSoloed.value = isSoloed;
        console.debug(`Multitrack::toggleAllSolo:isSoloed:${isSoloed}`);

        audio.mediaHandlers.forEach((handler) => {
            handler.fader.soloed = isSoloed;
            handler.fader.anySoloed = isSoloed === true;
        });

        isAnySoloed.value = isSoloed;
    }

    /** Toggles the mute state for all tracks
     */
    function toggleAllMute() {
        const isMuted = !isAllMuted.value;
        isAllMuted.value = isMuted;
        console.debug(`Multitrack::toggleAllMute:isMuted:${isMuted}`);

        audio.mediaHandlers.forEach((handler) => {
            handler.fader.muted = isMuted;
        });
    }

    /** Seeks all tracks to the given position
     * @param {number} position - the temporal position, in [seconds], to seek to
     * @returns A promise that resolves once all seek operations have been completed
     * and all track can play again.
     * @devdoc For any currently playing media,
     * internally corrects for the time passed since the origin of the method
     */
    async function seekAllToSeconds(position: number) {
        const originTime = performance.now();
        const seeks: Promise<void>[] = [];
        audio.mediaHandlers.forEach((handler) => {
            let offset = 0;
            if (!handler.paused) {
                offset =
                    (performance.now() - originTime) / millisecondsPerSecond;
            }
            seeks.push(
                handler.seekTo(position + offset, /*waitOnCanPlay*/ true),
            );
        });
        await Promise.all(seeks);
        console.debug(`Multitrack::seekAllToSeconds:canPlay:all`);
    }

    /** Seeks all track by the given timespan in [seconds]
     */
    async function seekAll(seconds: number) {
        return seekAllToSeconds(currentTime.value + seconds);
    }

    /** Forcibly synchronizes playback of all tracks
     * @devdoc Maintains an offset to compensate for the runtime of this method
     */
    async function syncTracks() {
        const originTime = performance.now();
        //console.debug(`Multitrack::syncTracks:originTime:${originTime}`);
        // get up-to date value
        const { avg } = updateCurrentTime();
        let targetTime = avg;
        targetTime += synchPlaybackOffset;
        await seekAllToSeconds(targetTime);

        // update after the sync
        nextTick(() => {
            updateCurrentTime();
        });

        // update the synch-offset with a very primitive running average
        const doneTime = performance.now();
        synchPlaybackOffset =
            (synchPlaybackOffset +
                synchPlaybackOffset +
                (doneTime - originTime) / millisecondsPerSecond) /
            3;
        synchPlaybackOffset =
            synchPlaybackOffset + synchPlaybackOffsetCorrection;
        // console.debug(
        //     `Multitrack::syncTracks:doneTime:${doneTime}ms:synchPlaybackOffset:${synchPlaybackOffset}s`,
        // );
    }

    /** Toggles playback of all tracks
     */
    function togglePlaybackAll() {
        // Decide whether to play or pause all
        if (isAllPaused.value) {
            audio.mediaHandlers.forEach(async (handler) => {
                handler.play();
            });
        } else {
            audio.mediaHandlers.forEach((handler) => {
                handler.pause();
            });
        }
    }

    /** Whether all tracks have their media resource loaded so far, that they
     * can play.
     */
    const canAllPlay = ref(false);

    /** Whether all tracks are muted */
    const isAllMuted = ref(false);

    /** Whether all tracks are soloed */
    const isAllSoloed = ref(false);

    /** Whether any track is soloed.
     * @remarks Facilitates solo handling for non-soloed tracks.
     */
    const isAnySoloed = ref(false);

    /** Whether all tracks are playing */
    const isAllPlaying = ref(false);

    /** Whether all tracks are paused */
    const isAllPaused = ref(true);

    /** Whether any track is fading */
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

    /** Gets the spreading of the track time positions of all tracks
     */
    const timeSpreading = ref(NaN);

    // --- subscribe to the events of the handlers ---

    const _pausedSubscriptons: Subscription[] = new Array<Subscription>();
    const _fadingSubscriptons: Subscription[] = new Array<Subscription>();
    const _mutedSubscriptions: Subscription[] = new Array<Subscription>();
    const _soloedSubscriptions: Subscription[] = new Array<Subscription>();
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
            //Thus comparison is pointless, and all existingsubscriptions are always
            //removed, then new subscriptions added again for all received handlers.

            // Remove all subscriptions that are not in the current set
            _pausedSubscriptons.forEach((subscription) => {
                subscription.cancel();
            });
            _fadingSubscriptons.forEach((subscription) => {
                subscription.cancel();
            });
            _mutedSubscriptions.forEach((subscription) => {
                subscription.cancel();
            });
            _soloedSubscriptions.forEach((subscription) => {
                subscription.cancel();
            });
            _canPlaySubscriptons.forEach((subscription) => {
                subscription.cancel();
            });
            _durationSubscriptons.forEach((subscription) => {
                subscription.cancel();
            });
            _positionSubscriptons.forEach((subscription) => {
                subscription.cancel();
            });

            // Add new subscriptions
            mediaHandlers.forEach((handler) => {
                _pausedSubscriptons.push(
                    handler.onPausedChanged.subscribe(updatePauseChanged),
                );

                _mutedSubscriptions.push(
                    handler.fader.onMutedChanged.subscribe(updateMutedChanged),
                );

                _soloedSubscriptions.push(
                    handler.fader.onSoloedChanged.subscribe(
                        updateSoloedChanged,
                    ),
                );

                _fadingSubscriptons.push(
                    handler.fader.onFadingChanged.subscribe(
                        updateFadingChanged,
                    ),
                );

                _canPlaySubscriptons.push(
                    handler.onCanPlay.subscribe(updateCanPlayChanged),
                );

                _durationSubscriptons.push(
                    handler.onDurationChanged.subscribe(updateDurationChanged),
                );

                _positionSubscriptons.push(
                    handler.onCurrentTimeChanged.subscribe(
                        updateCurrentTimeChanged,
                    ),
                );

                // set initial time value
                updateCurrentTimeChanged(handler.currentTime);
            });
            // set initial values
            updateDurationChanged();
            updateCanPlayChanged();
        },
        {
            immediate: true /* to handle it right after mount time */,
            deep: true /** Also watch for updates of mediaHandlers's entry set */,
        },
    );

    // --- handle the subscriptions ---

    // /** Sync after playback stops */
    watch(
        () => isAllPaused.value,
        (paused, wasPaused) => {
            if (paused && !wasPaused) {
                nextTick(() => {
                    syncTracks();
                });
            }
        },
        {
            immediate: true /* to handle it right after mount time */,
        },
    );

    // /** Sync after playback start */
    watch(
        () => isAllPlaying.value,
        (playing, wasPlaying) => {
            if (playing && !wasPlaying) {
                // A short delay seems to work best for sync after playback start
                // 300ms was determined optimal on Chromium on Linux
                setTimeout(() => {
                    syncTracks();
                }, 300);
            }
        },
        {
            immediate: true /* to handle it right after mount time */,
        },
    );

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
        } else {
            isAllPaused.value = false;
            for (const media of audio.mediaHandlers) {
                if (media.paused) {
                    isAllPlaying.value = false;
                    return; // as early as possible
                }
            }
            isAllPlaying.value = true;
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
     * @devdoc This method is optimized for early termination
     */
    function updateMutedChanged(muted: boolean) {
        if (muted === false) {
            isAllMuted.value = false;
            return; // as early as possible
        }
        for (const handler of audio.mediaHandlers) {
            if (handler.fader.muted === false) {
                isAllMuted.value = false;
                return; // as early as possible
            }
        }

        isAllMuted.value = true;
    }

    /**
     * @devdoc All handlers need to be checked every time
     */
    function updateSoloedChanged(soloed: boolean): void {
        // initial values will be updated in the loop anyway
        let anySoloed = soloed;
        let allSoloed = true;
        for (const media of audio.mediaHandlers) {
            if (media.fader.soloed) {
                anySoloed = true;
            } else {
                allSoloed = false;
            }
        }
        isAllSoloed.value = allSoloed;
        isAnySoloed.value = anySoloed;

        // Provide back the resulting any soloed state, for proper silencing
        for (const media of audio.mediaHandlers) {
            media.fader.anySoloed = anySoloed;
        }
    }

    /**
     * @devdoc All handlers need to be checked every time
     */
    function updateCanPlayChanged() {
        for (const media of audio.mediaHandlers) {
            if (!media.canPlay) {
                canAllPlay.value = false;
                return;
            }
        }
        canAllPlay.value = true;
    }

    /** Updates the duration by taking the shortest duration of all hadeled tracks */
    function updateDurationChanged() {
        let duration = NaN;
        audio.mediaHandlers.forEach((handler) => {
            console.debug(
                `Multitrack::updateDurationChanged:forEach:handler.duration:${handler.duration}`,
            );
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
     * @devdoc To keep system load low, just use a simple pass-thru
     */
    function updateCurrentTimeChanged(time: number) {
        currentTime.value = time;
    }

    /** Updates the multitrack current time, based on all tracks.
     * @remarks For any currently playing media,
     * this method corrects for the time passed from the first reading until all
     * readings have been gathered.
     * This operation is quite expensive and should only used when
     * required, e.g. before or after sync operations
     * The average and spreading value of the multitrack current time in [seconds]
     */
    function updateCurrentTime(): { avg: number; spreading: number } {
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
            }
        });
        if (readings.length === 0) {
            currentTime.value = NaN;
            return { avg: NaN, spreading: NaN };
        } else {
            // unskew the the readings
            //console.debug('Multitrack:updateCurrentTime:readings:', readings);
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

            //console.debug('Multitrack:updateCurrentTime:times:', times);

            // The times now are the most truthful readings with regard to the current moment in time
            // Now provide the average current time as fast as possible
            const sum = times.reduce((a, c) => a + c, 0);
            const avg = sum / times.length;
            currentTime.value = avg;

            const min = Math.min(...times);
            const max = Math.max(...times);
            const spreading = max - min;
            timeSpreading.value = spreading;

            return { avg, spreading };
        }
    }

    return {
        /** Toggles the solo state for all tracks
         */
        toggleAllSolo,
        /** Toggles the mute state for all tracks
         */
        toggleAllMute,
        /** Seeks all tracks to the given position
         * @param {number} position - the temporal position, in [seconds], to seek to
         * @returns A promise that resolves once all seek operations have been completed
         * and all track can play again.
         */
        seekAllToSeconds,
        seekAll,
        syncTracks,
        /** Updates the current time, with an average from all currently playing tracks.
         * Also calculates the min-max spreading of the times.
         */
        updateCurrentTime,
        togglePlaybackAll,
        /** Whether all tracks have their media resource loaded so far, that they
         * can play.
         */
        canAllPlay,
        /** Whether all tracks are soloed.
         */
        isAllSoloed,
        /** Whether any track is soloed.
         * @remarks Facilitates solo handling for non-soloed tracks.
         */
        isAnySoloed,
        /** Whether all tracks are muted.
         */
        isAllMuted,
        isAllPlaying,
        isAllPaused,
        isAnyFading,
        isAllMediaAvailable,
        allTrackDuration,
        currentTime,
        timeSpreading,
    };
});
