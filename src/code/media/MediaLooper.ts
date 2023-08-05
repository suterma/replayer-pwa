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
        const expectedLoopEventTime = this._loopEnd;
        const currentTime = this._media.currentTime;
        if (expectedLoopEventTime != null) {
            // estimate the expected loop event time
            const timeout =
                expectedLoopEventTime -
                currentTime +
                this.loopDetectionSafetyMarginSeconds;

            if (timeout <= 0) {
                //due or overdue, handle immediately
                this.handleTimeUpdateFor(currentTime);
            } else {
                console.debug('Scheduling to seconds:  ' + timeout);
                this.timeoutHandle = setTimeout(() => {
                    this.handleTimeUpdate();
                }, timeout * 1000);
            }
        }
    }

    SetLoop(start: number, end: number, mode: LoopMode): void {
        this._loopMode = mode;
        this._loopStart = start;
        this._loopEnd = end;

        //Make sure that looping at least at the end does occurr,
        //even if the loop end is set beyond the track end
        this._media.loop = true;
        this.scheduleNextTimeUpdateHandling();
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

    /** Handles time updates for the already retrieved current time
     * @remarks To be used when the current time is already known, to avoid an additional call
     * @devdoc Looping is solved here by observing and handling the recurring time updates.
     */
    handleTimeUpdateFor(currentTime: number): void {
        const loopMode = this.LoopMode;

        console.debug(
            'MediaLooper::handleTimeUpdateFor:currentTime:' + currentTime,
        );

        if (this._media.loop && this.isRangeAvailable()) {
            //NOTE: by asserting above, start and end time are known to be well defined here.
            this.handleLoop(
                currentTime,
                this.loopStart ?? 0,
                this.loopEnd ?? 0,
                loopMode,
            );
        }
    }

    /** Handles time updates for the already retrieved current time
     * @remarks To be used when the current time is already known, to avoid an additional call
     * @devdoc Looping is solved here by observing and handling the recurring time updates.
     */
    handleTimeUpdate(): void {
        this.handleTimeUpdateFor(this._media.currentTime);
    }

    /** An internal flag to prevent repeated fade-outs when looping */
    private isLoopFading = false;

    /** A safety margin for detecting the end of a track during playback
     * @remarks This value was empirically determined.
     * It's dependent of CPU power and timing accurracy
     */
    trackDurationSafetyMarginSeconds = 0.03;

    /** A safety margin for detecting scheduling due loops
     * @remarks This value was empirically determined.
     * It's dependent of CPU power and timing accurracy
     */
    loopDetectionSafetyMarginSeconds = 0.25;

    /** Handles looping
     * @param {number} currentTime - The time to decide looping on
     * @param {number} start - The start of the loop in [seconds]
     * @param {number} end - The end of the loop in [seconds]
     * @param {LoopMode} loopMode - how to handle the possible loop
     */
    handleLoop(
        currentTime: number,
        start: number,
        end: number,
        loopMode: LoopMode,
    ): void {
        //Is a ranged loop due because the end of the cue has been reached?
        const isAtCueEnd = currentTime >= end;
        //Is a ranged loop due anyway because the end of the track (with safety margin, for safe detection) has been reached?
        //NOTE: The actual end of the track should not be reached, to avoid unintended premature looping without proper fadeout handling.
        const isAtCueAtTrackEnd =
            currentTime >=
            this._media.duration - this.trackDurationSafetyMarginSeconds;

        if (isAtCueEnd || isAtCueAtTrackEnd) {
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
                        this.isLoopFading = false;
                        if (loopMode === LoopMode.Recurring) {
                            this._media.fader.fadeIn();
                            this.scheduleNextTimeUpdateHandling();
                        } else {
                            this._media.pause();
                        }
                    });
            }
        }
    }
}
