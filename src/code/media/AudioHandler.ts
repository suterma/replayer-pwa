import { ref } from 'vue';
import AudioFader from '../audio/AudioFader';
import { IMediaHandler } from './IMediaHandler';
import { SubEvent } from 'sub-events';

/** @class Implements a handler for audio data.
 * @remarks This handles transport and volume operations for audio sources (HTML Audio Elements).
 * See https://github.com/suterma/replayer-pwa/tree/main/doc/media-handling#readme
 * @devdoc Internally uses an AudioFader instance for most volume-related tasks.
 */
export default class AudioHandler implements IMediaHandler {
    // --- internals ---

    private _fader: AudioFader;

    /** The audio element instance to act upon */
    private _audio: HTMLAudioElement;

    /** @constructor
     * @param {HTMLAudioElement} audio - The audio element to act upon
     * @param {number} fadeInDuration - The fade-in duration. Default is 1000 (1 second)
     * @param {number} fadeOutDuration - The fade-out duration. Default is 500 (500 milliseconds)
     * @param {boolean} applyFadeInOffset - Whether to apply the seek offset before fade-in operations, to compensate the fading duration. (Default: true)
     * @param {number} masterVolume - The overall volume of the output. Can be used to control the output volume in addition to fadings. (Default: 1, representing full scale)
     * @param {string} id - The unique id
     */
    constructor(
        audio: HTMLAudioElement,
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
        this._audio = audio;
        this._id = id;
        this._fader = new AudioFader(
            audio,
            fadeInDuration,
            fadeOutDuration,
            applyFadeInOffset,
            masterVolume,
        );

        //Register event handlers first, as per https://github.com/shaka-project/shaka-player/issues/2483#issuecomment-619587797
        //this.audio.ontimeupdate = this.updateTime;
        audio.onloadeddata = () => {
            this.isClickToLoadRequired.value = false;
            const readyState = this._audio.readyState;
            this.debugLog(`onloadeddata:readyState:${readyState}`);
            this.handleReadyState(readyState);
        };
        audio.onloadedmetadata = () => {
            const readyState = this._audio.readyState;
            this.debugLog(`onloadedmetadata:readyState:${readyState}`);
            this.handleReadyState(readyState);
        };
        audio.ondurationchange = () => {
            const duration = this._audio.duration;
            this.debugLog(`ondurationchange:duration:${duration}`);
            this.updateDuration(duration);
        };
    }

    /** Updates the current settings.
     * @remarks The settings will be used for the next fade.
     * However, when the new duration is zero (no fade),
     * the cancel operation is immediately called, resetting the volume to the initial value for this case.
     * @param {number} fadeInDuration - The fade-in duration. Default is 1000 (1 second)
     * @param {number} fadeOutDuration - The fade-out duration. Default is 500 (500 milliseconds)
     * @param {boolean} applyFadeInOffset - Whether to apply the seek offset before fade-in operations, to compensate the fading duration. (Default: true)
     */
    updateSettings(
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
        console.debug(`AudioHandler(${this._id})::${message}:`, optionalParams);
    }

    // --- fading ---

    fadeOut(): Promise<void> {
        return this._fader.fadeOut();
    }

    fadeIn(): Promise<void> {
        return this._fader.fadeIn();
    }

    // --- volume ---

    /** Gets the muted state.
     */
    get muted(): boolean {
        return this._fader.muted;
    }
    /** Sets the muted state.
     */
    set muted(value: boolean) {
        this._fader.muted = value;
    }

    /** Gets the master audio volume, with the possible muted state observed
     * @returns A value between 0 (zero) and 1 (representing full scale), while observing the muted state.
     */
    // private getMasterAudioVolume(): number {
    //     if (!this.muted) {
    //         return this._fader.masterVolume;
    //     } else {
    //         return AudioFader.audioVolumeMin;
    //     }
    // }

    /** Sets the master audio volume
     * @remarks The value is applied immediately, without any fading, with the possible muted state observed
     * @param {number} volume - A value between 0 (zero) and 1 (representing full scale)
     */
    public setMasterAudioVolume(volume: number): void {
        this._fader.setMasterAudioVolume(volume);
    }

    // --- transport ---

    // pause(): void {
    //     //TODO start fading, with a task
    //     this.audio.pause();
    // }

    stop(): void {
        this._audio.pause();
        this._fader.cancel();
        this._fader.reset();
    }

    /** Gets the paused state.
     * @remarks During fading, the playback state is not considered as paused.
     */
    get paused(): boolean {
        return this._audio.paused;
    }

    // --- media loading ---

    /** Whether the media data has loaded (at least enough to start playback)
     * @remarks This implies that metadata also has been loaded already
     * @devdoc see HAVE_CURRENT_DATA at https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState#examples
     */
    hasLoadedData = ref(false);

    /** Whether the media metadata has loaded. Duration is available now.
     * @devdoc see HAVE_METADATA at https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState#examples
     */
    hasLoadedMetadata = ref(false);

    /** Flags, whether deferred loading (until a user play click event is handled)
     * is required to further load the track media file data. The flag may be set once after the metadata was successfully loaded.
     * @remarks When true, handling of a subsequent play action must first invoke a user-triggered load operation.
     * @remarks This specific handling is currently required on (some?) iOS devices,
     * because they only load data upon explicit user interaction.
     */
    isClickToLoadRequired = ref(false);

    /** Handles the load event of the audio element
     * @remarks Since loading is usually in progress now, this also resets the isClickToLoadRequired flag, unless
     * it is specifically detected, that further loading needs to be triggered
     */
    handleLoadedData(): void {
        this.isClickToLoadRequired.value = false;
        const readyState = this._audio.readyState;

        this.debugLog(`handleLoadedData:readyState:${readyState}`);
        this.handleReadyState(readyState);
    }

    /** If changed, updates the internal duration and emits the durationChanged event
     * @param {number} duration - could be NaN or infinity, depending on the source
     */
    updateDuration(duration: number): void {
        if (this.durationSeconds.value !== duration) {
            this.durationSeconds.value = duration;
            this.onDurationChanged.emit(this.durationSeconds.value);
        }
    }

    /** Handles the current ready state of the HTMLAudioElement's media, with regard to playability
     * @remarks Decides, whether deferred loading is required.
     */
    handleReadyState(readyState: number): void {
        //Enough of the media resource has been retrieved that the metadata attributes are initialized?
        if (readyState >= HTMLMediaElement.HAVE_METADATA) {
            if (!this.hasLoadedMetadata.value && !this.hasLoadedData.value) {
                this.hasLoadedMetadata.value = true;
                this.hasLoadedData.value = true;
                this.updateDuration(this._audio.duration);

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
        this.debugLog(`handleReadyState:buffered:`, this._audio.buffered);
        this.debugLog(
            `handleReadyState:networkState:${this._audio.networkState}`,
        );

        //When nothing is buffered at this moment, we can assume that the phone is not currently trying to load further data,
        //most probably due to load restriction on an iOS device using Safari.
        //Works on
        //- iPhone 13/Safari
        //- iPad Pro 12.9 2021/Safari (with audio from URL)
        //NOTE: This solution however seems not to work on:
        //- iPad 9th/Safari, because the buffered length is 1, but the sound will only play on 2nd click.
        if (this._audio.buffered.length === 0) {
            //The isClickToLoadRequired flag defers further media loading until the next user's explicit play request
            this.isClickToLoadRequired.value = true;
        }
    }

    /** Gets the duration of the current track, in [seconds]
     * @remarks This is only available after successful load of the media metadata.
     * Could be NaN or infinity, depending on the source
     */
    durationSeconds = ref<number | null>(null);

    /** Defines emittable loading events */

    /** Emits a changed duration.
     * @param {number} duration - could be NaN or infinity, depending on the source
     */
    onDurationChanged: SubEvent<number> = new SubEvent();
}
