import { IAudioFader } from './IAudioFader';
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
     * @param {HTMLMediaElement} media - The media element to act upon
     * @param {IAudioFader} fader - The fader to use, together with the element to act upon
     */
    constructor(media: HTMLMediaElement, fader: IAudioFader) {
        this._media = media;
        this._fader = fader;
        this._media.loop = false;
        this._media.ontimeupdate = this.handleTimeupdate;
    }

    /** The media element to act upon */
    private _media: HTMLMediaElement;

    /** The fader to use
     * @remarks This fader MUST act upon the same media element as given to this looper.
     */
    private _fader: IAudioFader;

    /** The loop start */
    private _loopStart: number | null = null;

    get loopStart(): number | null {
        return this._loopStart;
    }
    set loopStart(value: number | null) {
        this._loopStart = value;
        this.assertLoopMode();
    }

    /** The loop end */
    private _loopEnd: number | null = null;

    get loopEnd(): number | null {
        return this._loopEnd;
    }
    set loopEnd(value: number | null) {
        this._loopEnd = value;
        this.assertLoopMode();
    }

    /** The loop mode (recurring by default) */
    private _loopMode: LoopMode = LoopMode.Recurring;

    get LoopMode(): LoopMode {
        return this._loopMode;
    }
    set LoopMode(value: LoopMode) {
        this._loopMode = value;
    }

    get enabled(): boolean {
        return this._media.loop;
    }
    set enabled(requested: boolean) {
        if (requested && this.isRangeAvailable()) {
            this._media.loop == true;
        } else if (!requested) {
            this._media.loop == false;
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

    /** Asserts the availability of the properties and resets the loop, if necessary */
    private assertLoopMode() {
        if (!this.isRangeAvailable()) {
            this._media.loop == false;
        }
    }

    /** Handles time updates
     * @devdoc Looping is solved here by observing and handling the recurring time updates.
     */
    handleTimeupdate(/*event: Event*/): void {
        const currentTime = this._media.currentTime;
        const loopMode = this.LoopMode;

        // Additionally assert her, to make sure, no unexpected changes have been
        // to the media element from another actor
        this.assertLoopMode();
        if (this._media.loop) {
            //NOTE: by asserting above, start and end time are known to be well defined here.
            this.handleLoop(
                currentTime,
                this.loopStart ?? 0,
                this.loopEnd ?? 0,
                loopMode,
            );
        }
    }

    /** A safety margin for detecting the end of a track during playback */
    trackDurationSafetyMarginSeconds = 0.3;

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
        //Detect, with a safety margin, whether the possible loop is at track end
        //TODO actually use the known track duration here or the track end event
        const isAtTrackEnd =
            currentTime >= end - this.trackDurationSafetyMarginSeconds;

        //Is a loop due?
        if (currentTime >= end || isAtTrackEnd) {
            //Back to loop start
            this._fader.fadeOut().then(() => {
                this._media.currentTime = start;
                if (loopMode == LoopMode.Recurring) {
                    this._media.play(); //again
                    //TODO check should automatically fade in
                    //this._fader.fadeIn();
                }
            });

            if (isAtTrackEnd) {
                //
                //At the end of the track, a seek operation alone would not be enough to continue the loop
                //if playback already has ended (when the safety margin from above was too small)
                process.nextTick(() => {
                    //Directly issue the play command, without any safety net
                    //(should be working, since play was successful already)
                    //This handling here has the disadvantage, that a fading operation does take place however,
                    //if configured and the safety margin was too short.
                    this._media.play(); //again
                });
            }
        }
    }
}
