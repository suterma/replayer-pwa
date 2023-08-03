import AudioFader from './AudioFader';
import { IAudioFader } from './IAudioFader';
import { IMediaHandler } from './IMediaHandler';
import { SubEvent } from 'sub-events';

/** @class Implements a playback handler for a {HTMLMediaElement}.
 * @remarks This handles transport/loop and volume operations for audio sources (HTML media elements).
 * See https://github.com/suterma/replayer-pwa/tree/main/doc/media-handling#readme
 * @devdoc Looping and fading are internally handeled with their own handlers.
 */
export default class MediaHandler implements IMediaHandler {
    // --- internals ---

    private _fader: IAudioFader;

    /** The {HTMLMediaElement} instance to act upon */
    private _media: HTMLMediaElement;

    /** @constructor
     * @param {HTMLMediaElement} media - The media element to act upon
     * @param {number} fadeInDuration - The fade-in duration. Default is 1000 (1 second)
     * @param {number} fadeOutDuration - The fade-out duration. Default is 500 (500 milliseconds)
     * @param {boolean} applyFadeInOffset - Whether to apply the seek offset before fade-in operations, to compensate the fading duration. (Default: true)
     * @param {number} masterVolume - The overall volume of the output. Can be used to control the output volume in addition to fadings. (Default: 1, representing full scale)
     * @param {string} id - The unique id
     */
    constructor(
        media: HTMLMediaElement,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        fadeInDuration: number = 1000,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        fadeOutDuration: number = 500,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        applyFadeInOffset: boolean = true,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        masterVolume: number = 1,

        id = '',
    ) {
        this._media = media;
        this._id = id ? id : 'handler-' + media.id;
        this._fader = new AudioFader(
            media,
            fadeInDuration,
            fadeOutDuration,
            applyFadeInOffset,
            masterVolume,
        );

        //Register event handlers first, as per https://github.com/shaka-project/shaka-player/issues/2483#issuecomment-619587797
        this._media.onloadeddata = () => {
            this.isClickToLoadRequired = false;
            const readyState = this._media.readyState;
            this.debugLog(`onloadeddata:readyState:${readyState}`);
            this.handleReadyState(readyState);
        };

        this._media.onloadedmetadata = () => {
            const readyState = this._media.readyState;
            this.debugLog(`onloadedmetadata:readyState:${readyState}`);
            this.handleReadyState(readyState);
        };

        this._media.oncanplay = () => {
            this.debugLog(`oncanplay`);
            this.onCanPlay.emit();
        };

        this._media.ondurationchange = () => {
            const duration = this._media.duration;
            this.debugLog(`ondurationchange:duration:${duration}`);
            this.updateDuration(duration);
        };

        this._media.onpause = () => {
            this.debugLog(`onpause`);
            this.onPausedChanged.emit(true);
            //Upon reception of this event, playback has already paused.
            //No actual fade-out is required. However, to reset the volume to the minimum, a fast fade-out is still triggered
            this._fader.fadeOut(/*immediate*/ true);
        };

        this._media.onplay = () => {
            this.debugLog(`onplay`);
            this.onPausedChanged.emit(false);

            //Upon reception of this event, playback has already started. Fade-in is required if not yet ongoing.
            if (!this._fader.fading) {
                this._fader.fadeIn().catch((message) => console.log(message));
            }
        };

        this._media.ontimeupdate = () => {
            this.handleTimeUpdate();
        };

        this._media.onended = () => {
            this.handleEnded();
        };
    }

    // --- configuration and update ---

    /** Updates the current fading settings.
     * @remarks The settings will be used for the next fade.
     * However, when the new duration is zero (no fade),
     * the cancel operation is immediately called, resetting the volume to the initial value for this case.
     * @param {number} fadeInDuration - The fade-in duration. Default is 1000 (1 second)
     * @param {number} fadeOutDuration - The fade-out duration. Default is 500 (500 milliseconds)
     * @param {boolean} applyFadeInOffset - Whether to apply the seek offset before fade-in operations, to compensate the fading duration. (Default: true)
     */
    updateFadingSettings(
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        fadeInDuration: number = 1000,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        fadeOutDuration: number = 500,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        applyFadeInOffset: boolean = true,
    ): void {
        this._fader.updateSettings(
            fadeInDuration,
            fadeOutDuration,
            applyFadeInOffset,
        );
    }

    /** The uniqe id */
    _id: string;

    /** Gets the id.
     */
    get id(): string {
        return this._id;
    }

    /** Writes a debug log message message for this component */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debugLog(message: string, ...optionalParams: any[]): void {
        console.debug(`MediaHandler(${this._id})::${message}:`, optionalParams);
    }

    // --- fading ---

    /** Gets the audio fading handler
     */
    get fader(): IAudioFader {
        return this._fader;
    }

    // --- transport ---

    onPausedChanged: SubEvent<boolean> = new SubEvent();
    onCurrentTimeChanged: SubEvent<number> = new SubEvent();
    onEnded: SubEvent<void> = new SubEvent();

    /** Pauses playback, with fading if configured. */
    pause(): void {
        this.debugLog(`pause`);
        if (!this.paused) {
            this._fader
                .fadeOut()
                .catch((message) => console.log(message))
                .finally(() => {
                    this._media.pause();
                    this.onPausedChanged.emit(true);
                });
        }
    }

    //TODO watch and handle the audio element pause

    stop(): void {
        this._media.pause();
        this._fader.cancel();
        this._fader.reset();
    }

    /** Gets the paused state.
     * @remarks During fading, the playback state is not considered as paused.
     */
    get paused(): boolean {
        return this._media.paused;
    }

    /** Handles the time update event of the audio element
     */
    handleTimeUpdate(): void {
        this.onCurrentTimeChanged.emit(this._media.currentTime);
    }
    /** Handles the track end event of the audio element, by providing it further as event.
     */
    handleEnded(): void {
        this.onEnded.emit();
    }

    get currentTime(): number {
        return this._media.currentTime;
    }

    seekTo(seconds: number): void {
        if (!this.hasLoadedMetadata) return;
        if (this.currentTime === seconds) {
            return;
        }
        if (Number.isFinite(seconds)) {
            this._media.currentTime = seconds;
        }
    }

    seek(seconds: number): void {
        this.seekTo(this.currentTime + seconds);
    }

    playFrom(position: number): void {
        this.seekTo(position);
        this._media.play();
    }

    togglePlayback(): void {
        if (this.paused) {
            this._media.play();
        } else {
            this.pause();
        }
    }

    pauseAndSeekTo(position: number): void {
        this._fader.fadeOut().finally(() => {
            this.pause();
            this.seekTo(position);
        });
    }

    // --- media loading ---

    /** Gets the media source URL.
     */
    get mediaSourceUrl(): string {
        return this._media.src;
    }
    /** Sets the media source URL.
     */
    set mediaSourceUrl(url: string) {
        //Only update the media element, when a source is actually available
        //Otherwise the element throws an avoidable error
        if (url) {
            //NOTE: Just changing the .src property does not work when the track is currently playing
            //(observed on Ubuntu Google Chrome)
            //An error is only thrown only after the playback ends.
            //Thus, additional handling is necessary
            const isCurrentlyPlaying = !this.paused;
            const lastPosition = this.currentTime;
            this.pause();

            //Switch the source now, after pause
            this._media.src = url;

            //NOTE: This method assumes, that the new media for this is of (roughly) the same
            //length, just replacing the voice/instrument in the piece.
            //Thus, the playback position is maintained and not reset,
            //and the playing state is set again after the switch.
            //Otherwise the user will need to restart playback from
            //new position anyway
            this._media.currentTime = lastPosition;
            if (isCurrentlyPlaying) {
                this._media.play();
            }
        }
    }

    /** Emitted when the media data has loaded (at least enough to start playback)
     * @devdoc This is emitted separately from the data loading state and events, since the underlying
     * implementation does handle it separately.
     */
    onCanPlay: SubEvent<void> = new SubEvent();

    /** Whether the media data has loaded (at least enough to start playback)
     * @remarks This implies that metadata also has been loaded already
     * @devdoc see HAVE_CURRENT_DATA at https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState#examples
     */
    hasLoadedData = false;

    /** Whether the media metadata has loaded. Duration is available now.
     * @devdoc see HAVE_METADATA at https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState#examples
     */
    hasLoadedMetadata = false;

    isClickToLoadRequired = false;

    /** Handles the load event of the audio element
     * @remarks Since loading is usually in progress now, this also resets the isClickToLoadRequired flag, unless
     * it is specifically detected, that further loading needs to be triggered
     */
    handleLoadedData(): void {
        this.isClickToLoadRequired = false;
        const readyState = this._media.readyState;

        this.debugLog(`handleLoadedData:readyState:${readyState}`);
        this.handleReadyState(readyState);
    }

    /** If changed, updates the internal duration and emits the durationChanged event
     * @param {number} duration - could be NaN or infinity, depending on the source
     */
    updateDuration(duration: number): void {
        if (this._durationSeconds !== duration) {
            this._durationSeconds = duration;
            this.onDurationChanged.emit(this._durationSeconds);
        }
    }

    /** Handles the current ready state of the {HTMLMediaElement}'s media, with regard to playability
     * @remarks Decides, whether deferred loading is required.
     */
    handleReadyState(readyState: number): void {
        //Enough of the media resource has been retrieved that the metadata attributes are initialized?
        if (readyState >= HTMLMediaElement.HAVE_METADATA) {
            if (!this.hasLoadedMetadata && !this.hasLoadedData) {
                this.hasLoadedMetadata = true;
                this.hasLoadedData = true;
                this.updateDuration(this._media.duration);

                //Apply the currently known position to the player. It could be non-zero already.
                // //TODO probably use a specific initalPosition property for this
                // const position = currentPosition?.value;
                // if (
                //     position !== null &&
                //     position !== undefined &&
                //     Number.isFinite(position)
                // ) {
                //     seekToSeconds(position);
                // }
            }
        }

        //Special flag handling, when not  automatically loading further now
        this.debugLog(`handleReadyState:buffered:`, this._media.buffered);
        this.debugLog(
            `handleReadyState:networkState:${this._media.networkState}`,
        );

        //When nothing is buffered at this moment, we can assume that the phone is not currently trying to load further data,
        //most probably due to load restriction on an iOS device using Safari.
        //Works on
        //- iPhone 13/Safari
        //- iPad Pro 12.9 2021/Safari (with audio from URL)
        //NOTE: This solution however seems not to work on:
        //- iPad 9th/Safari, because the buffered length is 1, but the sound will only play on 2nd click.
        if (this._media.buffered.length === 0) {
            //The isClickToLoadRequired flag defers further media loading until the next user's explicit play request
            this.isClickToLoadRequired = true;
        }
    }

    /** The duration of the track
     * @remarks Is only available after loading of the track's media source
     */
    _durationSeconds: number | null = null;

    /** Gets the duration of the track
     * @remarks Is only available after loading of the track's media source
     */
    get durationSeconds(): number | null {
        return this._durationSeconds;
    }

    onDurationChanged: SubEvent<number> = new SubEvent();
}
