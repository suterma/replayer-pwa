import { IMediaHandler } from './IMediaHandler';
import { IMediaLooper, LoopMode } from './IMediaLooper';

/** @class Implements looping for an {HTMLMediaElement}, including fading.
 * @remarks Implements audio fading at the loop boundaries, with the help of an {IAudioFader}.
 * @devdoc This media element based approach (with observing of the current time)
 * is used to emulate the buffer looping for the enclosed media element in {IAudioFader}.
 * Replayer does intentionally not use buffered audio sources, to be able to play online media without CORS headers.
 * See https://www.w3.org/TR/webaudio/#looping-AudioBufferSourceNode for information about looping.
 */
export class MediaLooper implements IMediaLooper {
    /** @constructor
     * @param {IMediaHandler} media - The media handler to act upon
     */
    constructor(media: IMediaHandler) {
        this._media = media;

        //TODO this should later be solved better, consuming less resources
        //Possibly with a setInterval, together with a "reset", when
        //the user plays/pauses/seeks through the media
        //Unfortunately there can not be more than one arrow function per event
        //this._media.ontimeupdate = () => this.handleTimeUpdate();

        setInterval(() => this.handleTimeUpdate(), 30);
    }

    SetLoop(start: number, end: number, mode: LoopMode): void {
        this._loopMode = mode;
        this._loopStart = start;
        this._loopEnd = end;

        //Make sure that looping at least at the end does occurr,
        //even if the loop end is set beyond the track end
        this._media.loop = true;
    }
    RemoveLoop(): void {
        this._loopStart = null;
        this._loopEnd = null;

        //Make sure that looping at least at the end does occurr,
        //even if the loop end is set beyond the track end
        this._media.loop = false;
    }

    /** The media handler to act upon */
    private _media: IMediaHandler;

    /** The loop start */
    private _loopStart: number | null = null;

    get loopStart(): number | null {
        return this._loopStart;
    }
    set loopStart(value: number | null) {
        this._loopStart = value;
    }

    /** The loop end */
    private _loopEnd: number | null = null;

    get loopEnd(): number | null {
        return this._loopEnd;
    }
    set loopEnd(value: number | null) {
        this._loopEnd = value;
    }

    /** The loop mode (recurring by default) */
    private _loopMode: LoopMode = LoopMode.Recurring;

    get LoopMode(): LoopMode {
        return this._loopMode;
    }
    set LoopMode(value: LoopMode) {
        this._loopMode = value;
    }

    get loop(): boolean {
        return this._media.loop;
    }
    set loop(value: boolean) {
        this._media.loop = value;
    }

    get enabled(): boolean {
        return this._media.loop;
    }
    set enabled(requested: boolean) {
        if (requested && this.isRangeAvailable()) {
            this._media.loop = true;
        } else if (requested !== true) {
            this._media.loop = false;
        }
        //otherwise, if requested, but unavailable, ignore the request
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

    /** Handles time updates
     * @devdoc Looping is solved here by observing and handling the recurring time updates.
     */
    handleTimeUpdate(/*event: Event*/): void {
        const currentTime = this._media.currentTime;
        const loopMode = this.LoopMode;

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

    /** An internal flag to prevent repeated fade-outs when looping */
    private isLoopFading = false;

    /** A safety margin for detecting the end of a track during playback
     * @remarks This value has been empirically determinde.
     * It's dependent of CPU resources and timing accurracy
     */
    trackDurationSafetyMarginSeconds = 0.03;

    //TODO handle track looping,  * @remarks Track looping is handled elsewhere.
    //maybe by optionally setting an flag instead of the end time

    /** Handles looping
     * @remarks Looping is solved here by observing and handling the recurring time updates.
     * @param {number} currentTime - The time to decide looping on
     * @param {number} start - The start of the loop
     * @param {number} end - The end of the loop
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
                const immediateFadeOutRequired =
                    end + this._media.fader.fadeOutDuration >
                    this._media.duration -
                        this.trackDurationSafetyMarginSeconds;

                this._media.fader
                    .fadeOut(immediateFadeOutRequired)
                    .finally(() => {
                        this._media.seekTo(start);
                        this.isLoopFading = false;
                        if (loopMode === LoopMode.Recurring) {
                            this._media.fader.fadeIn();
                        } else {
                            this._media.pause();
                        }
                    });
            }
        }
    }
}
