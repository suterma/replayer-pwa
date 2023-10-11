import { v4 as uuidv4 } from 'uuid';
import { FadingMode, IAudioFader } from './IAudioFader';
import { SubEvent } from 'sub-events';
import type { Player } from '@vue-youtube/shared';
import AudioFader from './AudioFader';

/** @class Implements an audio fader for a YouTube player instance. This fader supports two concepts:
 * A master volume, that emulates a set, overall audio level, and independent fading operations, which internally
 * control the actually set audio level at the player instance.
 * @remarks Currently only supports a linear fade, with a constant gradient,
 * only determined by the predefined durations for a full-scale fade.
 */
export default class YouTubeFader implements IAudioFader {
    /** This is set to a fixed value, as a tradeoff between call frequency and smoothness
     * @devdoc This should be set to a value that produces small volume changes, that are barely audible
     */
    stepDuration = 16;

    /** Token for the currently running fade operation.
     * @remarks Allows an ongoing fading operation to determine whether it has been superseded
     * by a subsequent operation. This allows the first operation to reject the promise
     * and abandon the fade operation.
     */
    operationToken = YouTubeFader.cancelOperationToken;

    /** The muted state */
    private _muted = false;

    /** @constructor
     * @param {Player} audio - The YouTube player instance to act upon
     * @param {number} fadeInDuration - The fade-in duration. Default is 1000 (1 second)
     * @param {number} fadeOutDuration - The fade-out duration. Default is 500 (500 milliseconds)
     * @param {number} preRollDuration - Whether to apply the seek offset before fade-in operations, to compensate the fading duration. (Default: true)
     * @param {boolean} addFadeInPreRoll - Whether to apply the seek offset before fade-in operations, to compensate the fading duration. (Default: true)
     * @param {number} masterVolume - The overall volume of the output. Can be used to control the output volume in addition to fadings. (Default: 1, representing full scale)
     */
    constructor(
        audio: Player,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        fadeInDuration: number = 1000,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        fadeOutDuration: number = 500,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        preRollDuration: number = 0,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        addFadeInPreRoll: boolean = true,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        masterVolume: number = 1,
    ) {
        this.audio = audio;
        this.fadeInDuration = fadeInDuration;
        this.fadeOutDuration = fadeOutDuration;
        this.preRollDuration = preRollDuration;
        this.addFadeInPreRoll = addFadeInPreRoll;
        this.masterVolume = masterVolume;

        this.reset();
    }

    updateSettings(
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        fadeInDuration: number = 1000,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        fadeOutDuration: number = 500,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        preRollDuration: number = 0,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        addFadeInPreRoll: boolean = true,
    ): void {
        const noMoreFading =
            this.fadeInDuration != 0 &&
            fadeInDuration === 0 &&
            this.fadeOutDuration != 0 &&
            fadeOutDuration === 0;
        this.fadeInDuration = fadeInDuration;
        this.fadeOutDuration = fadeOutDuration;
        this.preRollDuration = preRollDuration;
        this.addFadeInPreRoll = addFadeInPreRoll;

        if (noMoreFading) {
            //Cancel immediately by setting the fader level to the initial value
            this.cancel();
        }
    }
    /** The YouTube player instance to act upon */
    audio: Player;
    /** The fade-in duration in [milliseconds] (zero means no fading)*/
    fadeInDuration;
    /** The fade-out duration in [milliseconds] (zero means no fading)*/
    fadeOutDuration;
    /** Whether to apply a seek offset before fade-in operations, to compensate the fading duration.*/
    addFadeInPreRoll = true;
    /** The amount of time to the seek backwards before a play operation. (Default: zero) */
    preRollDuration = 0;

    /** The master volume level
     * @remarks The master volume emulates an expected volume that is output from the fader, without any mute/solo/fading taken into account.
     */
    private masterVolume = 1;

    /** The minimum audio volume level
     * @remarks  -90dbFS Amplitude
     */
    public static audioVolumeMin = 0.00003162;
    /** The maximum audio volume level */
    public static audioVolumeMax = 1;

    private static cancelOperationToken = 'CANCEL';

    /** Resets the token for the currently running fade operation.
     * @remarks Allows operations to cancel themselves in favor of a subsequent operation.
     */
    cancel(): void {
        this.operationToken = YouTubeFader.cancelOperationToken;
    }

    /** If there is a currently running fade operation, reset the token.
     * @returns Whether an operation was ongoing
     */
    hadToCancel(): boolean {
        if (this.operationToken !== YouTubeFader.cancelOperationToken) {
            this.cancel();
            return true;
        }
        return false;
    }

    /** Sets the volume to the initial value.
     * @remarks This method is to be used at creation time or for a hard reset.
     * When a non-zero fading duration is set, this is the minimum value (prepare for the fade-in).
     * When a zero fading duration is set, this is the maximum value (effectively remove any fade).
     * Does not affect the muted state.
     */
    public reset(): void {
        this.audioVolume = this.initialVolume;
    }

    public destroy(): void {
        this.cancel();
        this.reset();
        this.operationToken = YouTubeFader.cancelOperationToken;
    }

    /** Geta the initial value for the volume
     */
    get initialVolume(): number {
        if (this.fadeInDuration || this.fadeOutDuration) {
            return AudioFader.audioVolumeMin;
        } else {
            return this.masterVolume;
        }
    }

    // --- fading ---

    /** Gets or sets whether fading is enabled.
     */
    isFadingEnabled = true;

    get fading(): boolean {
        if (this.operationToken != YouTubeFader.cancelOperationToken) {
            return true;
        }
        return false;
    }

    onFadingChanged: SubEvent<FadingMode> = new SubEvent();

    // --- transport ---

    /** Applies the pre-roll:
     * - an general offset/pre-roll according to the setting
     * - an offset/pre-roll to compensate for fade-in durations, if appliccable
     * @remarks At the beginning of a resource, the offset is cut off at zero.
     */
    applyPreRoll(): void {
        // The offset, in seconds
        let offset = this.preRollDuration;

        if (this.addFadeInPreRoll && this.fadeInDuration) {
            offset = offset + this.fadeInDuration / 1000;
        }

        const time = this.audio.getCurrentTime();
        const target = Math.max(0, time - offset);
        this.audio.seekTo(target, true);
    }

    // --- volume ---

    volumeDown(): number {
        return this.setVolume(
            Math.max(this.masterVolume * 0.71, AudioFader.audioVolumeMin),
        );
    }
    volumeUp(): number {
        return this.setVolume(
            Math.max(
                Math.min(this.masterVolume * 1.41, 1),
                AudioFader.audioVolumeMin,
            ),
        );
    }

    /** Gets the muted state.
     */
    get muted(): boolean {
        return this._muted;
    }

    /** Sets the muted state.
     */
    set muted(value: boolean) {
        this._muted = value;

        // Immediately apply the muting
        this.audioVolume = this.getVolume();
    }

    /** Gets the master audio volume, with the possible muted state (but not a possibly ongoing fade-in/fade-out) observed
     * @returns A value between 0 (zero) and 1 (representing full scale), while observing the muted state.
     */
    private getVolume(): number {
        if (!this.muted) {
            return this.masterVolume;
        } else {
            return AudioFader.audioVolumeMin;
        }
    }

    /** Returns a limited volume value, that satisfies the allowed audio volume range */
    private limited(volume: number): number {
        return Math.min(
            AudioFader.audioVolumeMax,
            Math.max(AudioFader.audioVolumeMin, volume),
        );
    }

    /** Internally sets the YouTube player volume, with the
     * level limited to the allowed audio volume range.
     * @devdoc The YouTube player uses a range betwenn 0 and 100
     */
    private set audioVolume(volume: number) {
        this.audio.setVolume(this.limited(volume) * 100);
    }

    /** Internally gets the YouTube player volume, with the
     * level limited to the allowed audio volume range.
     * @devdoc The YouTube player uses a range betwenn 0 and 100
     */
    private get audioVolume() {
        return this.limited(this.audio.getVolume() / 100);
    }

    /** @devdoc The actually applied output volume might be lower than the master volume, when a fade out is in progress. */
    public setVolume(volume: number): number {
        const previousVolume = this.masterVolume;
        const limitedVolume = this.limited(volume);

        if (previousVolume !== limitedVolume) {
            const fadingRatio = this.audioVolume / this.masterVolume;
            this.masterVolume = limitedVolume;
            this.audioVolume = this.getVolume() * fadingRatio;
            this.onVolumeChanged.emit(limitedVolume);
            return limitedVolume;
        }
        return previousVolume;
    }

    onVolumeChanged: SubEvent<number> = new SubEvent();

    fadeIn(): Promise<void> {
        //todo why does fading not work???

        if (this.hadToCancel()) {
            return Promise.resolve();
        } else {
            const currentMediaVolume = this.audioVolume;
            const currentMasterAudioVolume = this.getVolume();

            if (
                this.isFadingEnabled &&
                this.fadeInDuration &&
                currentMediaVolume < currentMasterAudioVolume
            ) {
                return new Promise((resolve) => {
                    this.applyPreRoll();
                    this.onFadingChanged.emit(FadingMode.FadeIn);
                    return this.fade(
                        currentMediaVolume,
                        currentMasterAudioVolume,
                        this.fadeInDuration,
                    )
                        .catch(() => {
                            console.debug(
                                `YouTubeFader::fadeIn:linear:aborted`,
                            );
                        })
                        .then(() => {
                            console.debug(`YouTubeFader::fadeIn:linear:ended`);
                        })
                        .finally(() => {
                            resolve();
                            this.onFadingChanged.emit(FadingMode.None);
                        });
                });
            } else {
                //nothing to fade
                this.audioVolume = currentMasterAudioVolume;
                return Promise.resolve();
            }
        }
    }

    /** Returns a linear fade promise for the currently playing track
     * @param duration {number} - A non-zero duration for the fading operation
     * @devdoc This currently only supports linear fade operations
     */
    private fade(from: number, to: number, duration: number): Promise<void> {
        return new Promise((resolve, reject) => {
            console.debug(
                `YouTubeFader::fading for:${duration}ms from:${from} to:${to}`,
            );
            //Set exactly to the expected begin volume
            this.audioVolume = from;

            //Start a repeated call sequence to gradually adjust the volume
            const stepSize = to - from;
            const endTime = new Date().getTime() + duration;
            const currentOperationToken = uuidv4();
            this.operationToken = currentOperationToken;
            const clearIntervalId = setInterval(() => {
                //Check whether it's time to end the fade
                //(By a cancel request)
                if (this.operationToken == YouTubeFader.cancelOperationToken) {
                    clearInterval(clearIntervalId);
                    const message =
                        'YouTubeFader::Linear fade aborted due to cancelling.';
                    console.warn(message);
                    //this.operationToken = YouTubeFader.cancelOperationToken;
                    reject(message);
                    return;
                }

                //(By a subsequent operation)
                if (this.operationToken != currentOperationToken) {
                    clearInterval(clearIntervalId);
                    this.cancel();
                    const message =
                        'YouTubeFader::Linear fade aborted due to a subsequent fade operation.';
                    console.warn(message);
                    //Set exactly to the expected end volume, starting from there for the next fade
                    this.audioVolume = to;
                    reject(message);
                    return;
                }

                //(by time is up)
                const now = new Date().getTime();
                if (now >= endTime) {
                    clearInterval(clearIntervalId);
                    this.cancel();
                    //Set exactly to the expected end volume, in case it was missed slightly
                    this.audioVolume = to;
                    resolve();
                    return;
                }

                //continue fading
                const remainingTime = endTime - now;
                const passedTime = duration - remainingTime;
                const stepTarget = from + (stepSize / duration) * passedTime;
                this.audioVolume = stepTarget;
            }, this.stepDuration);
        });
    }

    fadeOut(immediate?: boolean): Promise<void> {
        if (this.hadToCancel()) {
            return Promise.resolve();
        } else {
            const duration = immediate ? 0 : this.fadeOutDuration;
            const currentMediaVolume = this.audioVolume;
            if (
                this.isFadingEnabled &&
                duration &&
                currentMediaVolume != AudioFader.audioVolumeMin
            ) {
                return new Promise((resolve) => {
                    console.debug(
                        `YouTubeFader::fadeOut:currentMediaVolume:${currentMediaVolume}`,
                    );
                    this.onFadingChanged.emit(FadingMode.FadeOut);
                    return this.fade(
                        currentMediaVolume,
                        AudioFader.audioVolumeMin,
                        duration,
                    )
                        .catch(() => {
                            console.debug(
                                `YouTubeFader::fadeOut:linear:aborted`,
                            );
                        })
                        .then(() => {
                            console.debug(`YouTubeFader::fadeOut:linear:ended`);
                        })
                        .finally(() => {
                            resolve();
                            this.onFadingChanged.emit(FadingMode.None);
                        });
                });
            } else {
                //nothing to fade
                this.audioVolume = AudioFader.audioVolumeMin;
                return Promise.resolve();
            }
        }
    }
}
