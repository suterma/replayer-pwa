import { IMediaHandler } from './IMediaHandler';
import { IMediaLooper, LoopMode } from './IMediaLooper';

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
            if (!paused) {
                this.scheduleNextTimeUpdateHandling();
            }
        });

        media.onSeeked.subscribe(() => {
            this.scheduleNextTimeUpdateHandling();
        });
    }

    /** Cancels an exsiting set next time for an update handling
     */
    private cancelScheduleNextTimeUpdateHandling() {
        if (this.timeoutHandle) {
            clearTimeout(this.timeoutHandle);
        }
    }

    /** Schedules the next time update handling, with it's checking for due loops.
     * @remarks To minimize resource usage, this should be called only when necessary.
     * This includes seek operations, play operations and, optionally, for safety, seldom periodic calls.
     */
    private scheduleNextTimeUpdateHandling() {
        this.cancelScheduleNextTimeUpdateHandling();
        if (!this.isLoopFading && this._media.loop && this.isRangeAvailable()) {
            // Make sure we stay in the loop
            const fadeInStart = this._loopStart
                ? this._loopStart - this._media.fader.fadeInDuration
                : null;
            if (fadeInStart != null) {
                if (this._media.currentTime < fadeInStart) {
                    this._media.seekTo(fadeInStart);
                }
            }

            const loopEnd = this._loopEnd;
            const currentTime = this._media.currentTime;
            if (loopEnd != null) {
                const timeout = this.getSafeTimeout(currentTime, loopEnd);
                console.debug(
                    `MediaLooper::scheduleNextTimeUpdateHandling:timeout: ${timeout}`,
                );
                if (timeout <= 0) {
                    //due or overdue, handle immediately
                    console.debug(
                        `MediaLooper::scheduleNextTimeUpdateHandling:looping`,
                    );
                    this.handleLoop(
                        currentTime,
                        this.loopStart ?? 0,
                        this.loopEnd ?? 0,
                        this.LoopMode,
                    );
                } else {
                    console.debug(
                        `MediaLooper::scheduleNextTimeUpdateHandling:rescheduling`,
                    );
                    this.timeoutHandle = setTimeout(() => {
                        this.scheduleNextTimeUpdateHandling();
                    }, timeout * 1000);
                }
            }
        }
    }

    /** Gets the time remaining until of the loop range, with a safety margin applied for loop detection */
    getSafeTimeout(currentTime: number, loopEnd: number): number {
        // Is the loop end at track end?
        // NOTE: The actual end of the track should not be reached, to avoid
        // unintended premature looping without proper loop and fadeout handling.
        const isAtTrackEnd =
            loopEnd >=
            this._media.duration - this.trackDurationSafetyMarginSeconds;

        if (isAtTrackEnd) {
            return (
                loopEnd - currentTime - this.trackDurationSafetyMarginSeconds
            );
        }

        return loopEnd - currentTime - this.loopDetectionSafetyMarginSeconds;
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

    /** An internal flag to prevent repeated fade-outs when looping */
    private isLoopFading = false;

    /** A safety margin for detecting the end of a track during playback
     * while looping
     * @remarks This value was empirically determined.
     * It's dependent of CPU power and timing accurracy
     */
    trackDurationSafetyMarginSeconds = 0.1;

    /** A safety margin for detecting scheduling due loops
     * @remarks This value was empirically determined.
     * It's dependent of CPU power and timing accurracy
     */
    loopDetectionSafetyMarginSeconds = 0;

    /** Handles looping for the given timings
     * @remarks Determines whether a loop is deemed required due to the timings and returns a boolean accordingly
     * @param {number} currentTime - The time to decide looping on
     * @param {number} start - The start of the loop in [seconds]
     * @param {number} end - The end of the loop in [seconds]
     * @param {LoopMode} loopMode - how to handle the possible loop
     * @returns {boolean} whether looping has been executed (with preceding fading if required)
     */
    handleLoop(
        currentTime: number,
        start: number,
        end: number,
        loopMode: LoopMode,
    ): boolean {
        //Is a ranged loop due because the end of the loop range has been reached?
        const timeout = this.getSafeTimeout(currentTime, end);
        if (timeout <= 0) {
            //Back to loop start (with fading)
            if (!this.isLoopFading) {
                this.isLoopFading = true;

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
                        this._media.seekTo(start);
                        if (loopMode === LoopMode.Recurring) {
                            // Wait until the seek operation has executed
                            // NOTE: A nextTick operation seems not to work here
                            // with all media handlers.
                            // Maybe, on a later version, the seek operation
                            // could be implemented as a promise,
                            // then use a promise-based approach
                            window.setTimeout(() => {
                                this._media.fader.fadeIn();
                                this.scheduleNextTimeUpdateHandling();
                            }, 1);
                        } else {
                            this._media.pause();
                        }
                        // Reset loop fading last, because this prevents
                        // unnecessary reschedulings during the above seek
                        // and fade operations
                        this.isLoopFading = false;
                    });

                return true;
            }
        }
        return false;
    }
}
