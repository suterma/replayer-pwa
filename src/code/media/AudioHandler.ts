import AudioFader from '../audio/AudioFader';
import { IMediaHandler } from './IMediaHandler';

/** @class Implements a handler for audio data.
 * @remarks This handles transport and volume operations for audio sources (HTML Audio Elements).
 * See https://github.com/suterma/replayer-pwa/tree/main/doc/media-handling#readme
 * @devdoc Internally uses an AudioFader instance for most volume-related tasks.
 */
export default class AudioHandler implements IMediaHandler {
    private _fader: AudioFader;

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
        this.audio = audio;
        this._id = id;
        this._fader = new AudioFader(
            audio,
            fadeInDuration,
            fadeOutDuration,
            applyFadeInOffset,
            masterVolume,
        );
    }
    fadeOut(): Promise<void> {
        return this._fader.fadeOut();
    }
    fadeIn(): Promise<void> {
        return this._fader.fadeIn();
    }

    // pause(): void {
    //     //TODO start fading, with a task
    //     this.audio.pause();
    // }

    stop(): void {
        this.audio.pause();
        this._fader.cancel();
        this._fader.reset();
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
    /** The audio element instance to act upon */
    audio: HTMLAudioElement;

    /** The uniqe id */
    _id: string;

    /** Gets the id.
     */
    get id(): string {
        return this._id;
    }

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

    /** Gets the paused state.
     * @remarks During fading, the playback state is not considered as paused.
     */
    get paused(): boolean {
        return this.audio.paused;
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
}
