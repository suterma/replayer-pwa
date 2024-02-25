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

        media.onCurrentTimeChanged.subscribe((currentTime) => {
            console.debug(
                'MediaLooper::onCurrentTimeChanged:currentTime',
                currentTime,
            );

            if (this._isLoopDefined) {
                this.handleLoop(
                    currentTime,
                    this._loopStart as number,
                    this._loopEnd as number,
                    this._loopMode,
                );
            }
        });
    }

    /** Gets the time remaining until of the end of the loop range, with a safety margin applied for loop detection */
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

        if (isDirty) {
            this._isLoopDefined = this.isRangeAvailable();
        }

        //Make sure that looping at least at the end does occurr,
        //even if the loop end is set beyond the track end
        this._media.loop = true;
    }

    RemoveLoop(): void {
        this._loopStart = null;
        this._loopEnd = null;
        this._media.loop = false;
        this._isLoopDefined = false;
    }

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

    /** An internal flag to quickly determine whether a loop is well defined (boundaries are properly set) */
    private _isLoopDefined: boolean = false;

    /** Determines whether the looping range is well defined (boundaries are properly set) */
    private isRangeAvailable() {
        return (
            this._loopStart != null &&
            this._loopEnd != null &&
            Number.isFinite(this._loopStart) &&
            Number.isFinite(this._loopEnd)
        );
    }

    /** Whether playback is currently handling the loop end / fading out after the loop end has been reached.
     * @remarks This is (an internal) flag to prevent re-triggering of loops / fade-outs when looping */
    private isLoopEndFadingOut = false;

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
     * @remarks Determines whether a loop is deemed required due to the timings
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
        //Is a ranged loop due because the end of the loop range has been reached?
        const timeout = this.getSafeTimeout(currentTime, end);
        if (timeout <= 0) {
            console.debug('MediaLooper::handleLoop:timeout-detected', timeout);
            //Back to loop start (with fading)
            if (!this.isLoopEndFadingOut) {
                this.isLoopEndFadingOut = true;
                if (this._media.fader.isFadingEnabled) {
                    // Determine whether fadeout would be after track end
                    // Typically happens for the last cue in a track
                    const fadeEnd =
                        end + this._media.fader.fadeOutDuration / 1000;
                    const safeTrackEnd =
                        this._media.duration -
                        this.trackDurationSafetyMarginSeconds;
                    const immediateFadeOutRequired = fadeEnd >= safeTrackEnd;

                    this._media.fader
                        .fadeOut(immediateFadeOutRequired)
                        .finally(() => {
                            this._media.seekTo(start);
                            if (loopMode === LoopMode.Once) {
                                this._media.pause();
                            } else {
                                this._media.fader.fadeIn();
                            }
                            this.isLoopEndFadingOut = false;
                        });
                } else {
                    //no fading
                    const offset = start - end;
                    console.debug(
                        'MediaLooper::handleLoop:no-fading:offset:',
                        offset,
                    );
                    this._media.seek(offset);
                }
            }
        } else {
            this.isLoopEndFadingOut = false;
        }
    }
}
