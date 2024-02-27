import type { IMediaHandler } from './IMediaHandler';
import { type IMediaLooper, LoopMode } from './IMediaLooper';

/** @class Implements range looping for an {IMediaHandler}, including fading.
 * @remarks Implements audio fading at the loop boundaries, with the help of an {IAudioFader}.
 * @devdoc This IMediaHandler based approach (with observing of the current time on the wrapped media element)
 * is used to emulate the buffer looping for the enclosed media element.
 * Replayer does intentionally not use buffered audio sources, to be able to play online media without CORS headers.
 * See https://www.w3.org/TR/webaudio/#looping-AudioBufferSourceNode for information about looping.
 */
export class MediaLooper implements IMediaLooper {
    /** @constructor
     * @param {IMediaHandler} media - The media handler to act upon
     */
    constructor(media: IMediaHandler) {
        this._media = media;

        // register for the required events
        media.onPausedChanged.subscribe((paused: boolean) => {
            this._isPaused = paused;
            if (!paused) {
                // when playing, make sure to watch out of the next loop
                this.scheduleNextTimeUpdateHandling();
            } else {
                // when paused, there is no need to schedule anything
                this.cancelScheduleNextTimeUpdateHandling();
            }
        });

        media.onSeeked.subscribe(() => {
            if (!this._isPaused && !this.isLoopEndFadingOut)
                this.scheduleNextTimeUpdateHandling();
        });

        media.playbackRateController.onPlaybackRateChanged.subscribe(() => {
            if (!this._isPaused) this.scheduleNextTimeUpdateHandling();
        });
    }

    /** Cancels an exsiting set next time for an update handling
     */
    private cancelScheduleNextTimeUpdateHandling() {
        if (this.timeoutHandle) {
            clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
        }
    }

    /** Schedules the next time update handling, with it's checking for due loops.
     * @remarks To minimize resource usage, this should be called only when necessary.
     * This includes seek and play operations.
     */
    private scheduleNextTimeUpdateHandling() {
        this.cancelScheduleNextTimeUpdateHandling();

        // Is looping set, and we are not currently doing a loop end fade-out?
        if (
            !this.isLoopEndFadingOut &&
            !this._isPaused &&
            this._media.loop &&
            this.isRangeAvailable()
        ) {
            // Make sure we stay in the loop
            const loopEnd = this._loopEnd;
            const currentTime = this._media.currentTime;
            if (loopEnd != null) {
                const timeout = this.getSafeTimeout(currentTime, loopEnd);
                console.debug(
                    `MediaLooper::scheduleNextTimeUpdateHandling:timeout: ${timeout}`,
                );
                if (timeout <= 0 + this.nonReschedulingMargin) {
                    //due or overdue, handle immediately
                    this.doLoop(
                        this.loopStart ?? 0,
                        this.loopEnd ?? 0,
                        this.LoopMode,
                    );
                } else {
                    this.timeoutHandle = setTimeout(
                        () => {
                            this.scheduleNextTimeUpdateHandling();
                        },
                        (timeout * 1000) /
                            this._media.playbackRateController.playbackRate,
                    );
                    console.debug(
                        `MediaLooper::scheduleNextTimeUpdateHandling:rescheduled`,
                        timeout,
                    );
                }
            }
        }
    }

    /** Gets the time remaining until of the end of the loop range, with a safety margin applied for loop detection */
    getSafeTimeout(currentTime: number, loopEnd: number): number {
        // Is the loop end at track end?
        // NOTE: The actual end of the track should not be reached, to avoid
        // unintended premature looping without proper loop and fadeout handling.
        const mediaDuration = this._media.duration;
        const isAtTrackEnd =
            mediaDuration &&
            loopEnd >= mediaDuration - this.trackDurationSafetyMarginSeconds;

        if (isAtTrackEnd) {
            return (
                loopEnd - currentTime - this.trackDurationSafetyMarginSeconds
            );
        }

        return loopEnd - currentTime;
    }

    SetLoop(start: number, end: number, mode: LoopMode): void {
        let isDirty = false;
        if (this._loopMode !== mode) {
            this._loopMode = mode;
            isDirty = true;
        }
        if (this._loopStart !== start) {
            this._loopStart = start;
            isDirty = true;
        }
        if (this._loopEnd !== end) {
            this._loopEnd = end;
            isDirty = true;
        }

        //Make sure that looping at least at the end does occurr,
        //even if the loop end is set beyond the track end
        this._media.loop = true;

        if (isDirty) {
            this.scheduleNextTimeUpdateHandling();
        }
    }
    RemoveLoop(): void {
        this.cancelScheduleNextTimeUpdateHandling();
        this._loopStart = null;
        this._loopEnd = null;
        this._media.loop = false;
    }

    private timeoutHandle: NodeJS.Timeout | null = null;

    /** The media handler to act upon */
    private _media: IMediaHandler;

    /** Whether media playback is paused */
    private _isPaused: boolean = true;

    /** The loop start */
    private _loopStart: number | null = null;

    get loopStart(): number | null {
        return this._loopStart;
    }

    /** The loop end */
    private _loopEnd: number | null = null;

    get loopEnd(): number | null {
        return this._loopEnd;
    }

    /** The loop mode (recurring by default) */
    private _loopMode: LoopMode = LoopMode.Recurring;

    get LoopMode(): LoopMode {
        return this._loopMode;
    }

    get loop(): boolean {
        return this._media.loop;
    }

    /** Determines whether the looping range is well defined (boundaries are properly set) */
    private isRangeAvailable() {
        return (
            this._loopStart != null &&
            this._loopEnd != null &&
            Number.isFinite(this._loopStart) &&
            Number.isFinite(this._loopEnd)
        );
    }

    /** Whether playback is currently fading out after the loop end has been reached.
     * @remarks This is (an internal) flag to prevent re-triggering of fade-outs when looping */
    private isLoopEndFadingOut = false;

    /** The range for which a too short loop timer is not rescheduled.
     * @remarks Experience has shown, that small rescheduling near the end of the
     * actual loop end worsen the loop timing. These are prevented within
     * this margin.
     */
    private nonReschedulingMargin = 0.3;

    /** A safety margin for detecting the end of a track during playback
     * while looping
     * @remarks This value was empirically determined.
     * It's dependent of CPU power and timing accurracy
     */
    private trackDurationSafetyMarginSeconds = 0.1;

    /** A measured duration for the seek operation when executing a loop
     * in [seconds]. This is used
     * to compensate the seek target with, to have the loop start accounted for
     * this duration
     * @remarks This value is measured at each executed loop. The set value
     * is a reasonable default.
     */
    private loopSeekingDurationToCompensate = 0.01;

    /** Executes a due loop for the given timings
     * @remarks Determines whether a loop is deemed required due to the timings and returns a boolean accordingly
     * @param {number} start - The start of the loop in [seconds]
     * @param {number} end - The end of the loop in [seconds]
     * @param {LoopMode} loopMode - how to handle the possible loop
     */
    doLoop(start: number, end: number, loopMode: LoopMode): void {
        //Back to loop start (with fading)
        if (!this.isLoopEndFadingOut) {
            this.isLoopEndFadingOut = true;

            //Handle the special case of uninterrupted, continuous loop
            if (
                loopMode === LoopMode.Recurring &&
                !this._media.fader.isFadingEnabled
            ) {
                const tLoopHandlingStart = performance.now();
                console.debug(`MediaLooper::doLoop:fast`);
                this._media
                    .seekTo(start + this.loopSeekingDurationToCompensate)
                    .then(() => {
                        this.isLoopEndFadingOut = false;
                        const tLoopHandlingFinish = performance.now();
                        this.scheduleNextTimeUpdateHandling();
                        this.loopSeekingDurationToCompensate =
                            (tLoopHandlingFinish - tLoopHandlingStart) / 1000;
                        console.log(
                            `Call to do fast looping took ${this.loopSeekingDurationToCompensate * 1000} milliseconds.`,
                        );
                    });
            } else {
                console.debug(`MediaLooper::doLoop:faded`);
                // Determine whether fadeout would be after track end
                // Typically happens for the last cue in a track
                const fadeEnd = end + this._media.fader.fadeOutDuration / 1000;
                const safeTrackEnd =
                    this._media.duration -
                    this.trackDurationSafetyMarginSeconds;
                const immediateFadeOutRequired = fadeEnd >= safeTrackEnd;

                this._media.fader
                    .fadeOut(immediateFadeOutRequired)
                    .finally(() => {
                        const tLoopHandlingStart = performance.now();
                        //Determine the actual offset required
                        const fadeInPreRoll =
                            this._media.fader.isFadingEnabled &&
                            this._media.fader.addFadeInPreRoll &&
                            loopMode === LoopMode.Recurring
                                ? this._media.fader.fadeInDuration / 1000
                                : 0;
                        this._media
                            .seekTo(
                                start -
                                    fadeInPreRoll +
                                    this.loopSeekingDurationToCompensate,
                            )
                            .then(() => {
                                // Reset loop fading just before next scheduling,
                                // because this prevents
                                // unnecessary reschedulings during the above seek
                                // and fade operations
                                this.isLoopEndFadingOut = false;
                                const tLoopHandlingFinish = performance.now();
                                this.loopSeekingDurationToCompensate =
                                    (tLoopHandlingFinish - tLoopHandlingStart) /
                                    1000;
                                console.log(
                                    `Call to do faded looping took ${this.loopSeekingDurationToCompensate * 1000} milliseconds.`,
                                );

                                if (loopMode === LoopMode.Recurring) {
                                    this._media.fader.fadeIn();
                                    this.scheduleNextTimeUpdateHandling();
                                } else {
                                    this._media.pause();
                                }
                            });
                    });
            }
        }
    }
}
