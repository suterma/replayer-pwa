/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

import { v4 as uuidv4 } from 'uuid';
import { FadingMode, type IAudioFader } from './IAudioFader';
import { SubEvent } from 'sub-events';

/** @class Implements an audio fader for an HTML media element instance. This fader supports two concepts:
 * - a master volume, that emulates a set, overall audio level
 * - independent fading operations, which internally control the actually set audio level at the media element.
 * @remarks Currently only supports a linear audio fade, with a constant gradient,
 * only determined by the predefined durations for a full-scale fade.
 * Video content, in case of an HTMLVideoElement, is not changed in any way.
 */
export default class AudioFader implements IAudioFader {
    /** The fading step duration, in [milliseconds]. This is set to a fixed value,
     * as a tradeoff between call frequency and smoothness
     * @devdoc This should be set to a value that produces small volume changes,
     * that are barely audible
     */
    private static stepDuration = 16;

    private static cancelOperationToken = 'CANCEL';

    /** The token for the currently running fade operation.
     * @remarks Allows an ongoing fading operation to determine whether it has been superseded
     * by a subsequent operation. This allows the first operation to reject the promise
     * and abandon the fade operation in favor of the later one.
     */
    operationToken = AudioFader.cancelOperationToken;

    /** @constructor
     * @param {HTMLMediaElement} audio - The HTML media element to act upon
     * @param {number} fadeInDuration - The fade-in duration in [seconds]. Default is 1000 (1 second)
     * @param {number} fadeOutDuration - The fade-out duration in [seconds]. Default is 500 (500 milliseconds)
     * @param {number} preRollDuration - The amount of time in [milliseconds] to the seek backwards before a play operation. (Default: zero)
     * @param {boolean} addFadeInPreRoll - Whether to apply the seek offset before fade-in operations, to compensate the fading duration. (Default: true)
     * @param {number} masterVolume - The overall volume of the output.
     * Can be used to control the output volume in addition to fadings. (Default: 1, representing full scale)
     */
    constructor(
        audio: HTMLMediaElement,
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

        // Fixed default
        this.isFadingEnabled = true;

        this.reset();

        this.setupVolumeChangeEmissions();
    }

    /** Sets up emission of intentional volume changes on the HTML media element.
     * @remarks This allows a user to control the volume direcly from the
     * HTML audio element controls, which are usually coupled with external input
     * devices like Bluetooth headsets. NOTE: Only changes that are not caused by
     * internal automation are considered.
     */
    setupVolumeChangeEmissions(): void {
        this.audio.onvolumechange = () => {
            if (
                !this.fading &&
                !this.muted &&
                !this.anySoloed &&
                !this.soloed &&
                !this.audio.paused &&
                /** Seeking seems to cause volume changes, thus omitted here */
                !this.audio.seeking
            ) {
                const currentVolume = this.audio.volume;
                if (currentVolume != this.masterVolume) {
                    this.masterVolume = currentVolume;
                    console.debug('onvolumechange-non-fading:', currentVolume);
                    this.onVolumeChanged.emit(currentVolume);
                }
            }
        };
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
    /** The audio element instance to act upon */
    audio: HTMLAudioElement;
    /** The fade-in duration in [milliseconds] (zero means no fading)*/
    fadeInDuration;
    /** The fade-out duration in [milliseconds] (zero means no fading)*/
    fadeOutDuration;
    /** Whether to apply a seek offset before fade-in operations, to compensate the fading duration.*/
    addFadeInPreRoll = true;
    /** The amount of time in [milliseconds] to the seek backwards before a play operation. (Default: zero) */
    preRollDuration = 0;

    /** The master volume level
     * @remarks The master volume emulates an expected volume that is output from the fader, without any mute/solo/fading taken into account.
     */
    private masterVolume = 1;

    /** The minimum audio volume level
     * @remarks  -90dbFS Amplitude
     */
    private static audioVolumeMin = 0.00003162;

    /** The maximum audio volume level */
    private static audioVolumeMax = 1;

    /** Resets the token for the currently running fade operation.
     * @remarks Allows operations to cancel themselves in favor of a subsequent operation.
     */
    cancel(): void {
        this.operationToken = AudioFader.cancelOperationToken;
    }

    /** If there is a currently running fade operation, reset the token.
     * @returns Whether an operation was ongoing
     */
    hadToCancel(): boolean {
        if (this.operationToken !== AudioFader.cancelOperationToken) {
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
        if (this.effectiveFadeInDuration || this.effectiveFadeOutDuration) {
            this.audioVolume = AudioFader.audioVolumeMin;
        } else {
            this.audioVolume = this.masterVolume;
        }
    }

    public destroy(): void {
        this.cancel();
        this.reset();
        this.operationToken = AudioFader.cancelOperationToken;
    }

    // --- fading ---

    /** Gets or sets whether fading is enabled.
     */
    isFadingEnabled = true;

    get fading(): boolean {
        if (this.operationToken != AudioFader.cancelOperationToken) {
            return true;
        }
        return false;
    }

    /** Gets the effective fade-in duration, in [milliseconds], taking into account whether fade-in is enabled. */
    get effectiveFadeInDuration(): number {
        if (!this.isFadingEnabled) {
            return 0;
        }
        return this.fadeInDuration;
    }
    /** Gets the effective fade-out duration, in [milliseconds], taking into account whether fade-out is enabled. */
    get effectiveFadeOutDuration(): number {
        if (!this.isFadingEnabled) {
            return 0;
        }
        return this.fadeOutDuration;
    }

    onFadingChanged: SubEvent<FadingMode> = new SubEvent();

    // --- transport ---

    /** Gets or sets whether pre-roll is enabled.
     */
    isPreRollEnabled = true;

    /** Applies the pre-roll:
     * - an general offset/pre-roll according to the setting
     * - an offset/pre-roll to compensate for fade-in durations, if appliccable
     * @remarks At the beginning of a resource, the offset is cut off at zero.
     */
    applyPreRoll(): void {
        // The offset, in seconds
        let offset = this.isPreRollEnabled ? this.preRollDuration : 0;

        if (this.addFadeInPreRoll && this.effectiveFadeInDuration) {
            offset = offset + this.effectiveFadeInDuration / 1000;
        }

        if (offset) {
            const time = this.audio.currentTime;
            const target = Math.max(0, time - offset);
            this.audio.currentTime = target;
        }
    }

    // --- mute/solo ---

    onMutedChanged: SubEvent<boolean> = new SubEvent();

    /** The muted state */
    private _muted = false;

    /** @inheritdoc
     */
    get muted(): boolean {
        return this._muted;
    }

    /** @inheritdoc
     */
    set muted(value: boolean) {
        console.debug(`AudioFader::muted:value:${value}`);

        this._muted = value;
        this.audio.volume = this.getVolume();
        this.onMutedChanged.emit(value);
    }

    onSoloedChanged: SubEvent<boolean> = new SubEvent();

    /** The soloed state */
    private _soloed = false;

    /** @inheritdoc
     */
    get soloed(): boolean {
        return this._soloed;
    }

    /** @inheritdoc
     */
    set soloed(value: boolean) {
        console.debug(`AudioFader::soloed:value:${value}`);

        this._soloed = value;
        if (value) {
            this.anySoloed = true;
        }
        this.audio.volume = this.getVolume();
        this.onSoloedChanged.emit(value);
    }

    /** The any soloed state */
    private _anySoloed = false;

    /** @inheritdoc
     */
    get anySoloed(): boolean {
        return this._anySoloed;
    }

    /** @inheritdoc
     */
    set anySoloed(value: boolean) {
        console.debug(`AudioFader::anySoloed:value:${value}`);
        this._anySoloed = value;
        this.audio.volume = this.getVolume();
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

    /** Gets the master audio volume, with the possible muted and soloed state
     * (but not a possibly ongoing fade-in/fade-out) observed
     * @remarks A muted state returns the min volume.
     * A non-soloed state, when any is soloed, returns the min volume.
     * @returns A value between 0 (zero) and 1 (representing full scale), while observing the muted state.
     */
    private getVolume(): number {
        if (!this.muted && (this.soloed || !this.anySoloed)) {
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

    /** Internally sets the media element volume, with the
     * level limited to the allowed audio volume range.
     */
    private set audioVolume(volume: number) {
        this.audio.volume = this.limited(volume);
    }

    /** Internally gets the media element volume, with the
     * level limited to the allowed audio volume range.
     */
    private get audioVolume() {
        return this.limited(this.audio.volume);
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
        if (this.hadToCancel()) {
            return Promise.resolve();
        } else {
            const currentMediaVolume = this.audioVolume;
            const currentMasterAudioVolume = this.getVolume();
            this.applyPreRoll();

            if (
                this.effectiveFadeInDuration &&
                currentMediaVolume < currentMasterAudioVolume
            ) {
                return new Promise((resolve) => {
                    this.onFadingChanged.emit(FadingMode.FadeIn);
                    return this.fade(
                        currentMediaVolume,
                        currentMasterAudioVolume,
                        this.effectiveFadeInDuration,
                    )
                        .catch(() => {
                            console.debug(`AudioFader::fadeIn:linear:aborted`);
                        })
                        .then(() => {
                            console.debug(`AudioFader::fadeIn:linear:ended`);
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
                `AudioFader::fading for:${duration}ms from:${from} to:${to}`,
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
                if (this.operationToken == AudioFader.cancelOperationToken) {
                    clearInterval(clearIntervalId);
                    const message =
                        'AudioFader::Linear fade aborted due to cancelling.';
                    console.warn(message);
                    reject(message);
                    return;
                }

                //(By a subsequent operation)
                if (this.operationToken != currentOperationToken) {
                    clearInterval(clearIntervalId);
                    this.cancel();
                    const message =
                        'AudioFader::Linear fade aborted due to cancelling or a subsequent fade operation.';
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
            }, AudioFader.stepDuration);
        });
    }

    fadeOut(immediate?: boolean): Promise<void> {
        if (this.hadToCancel()) {
            return Promise.resolve();
        } else {
            const duration = immediate ? 0 : this.effectiveFadeOutDuration;
            const currentMediaVolume = this.audioVolume;
            if (duration && currentMediaVolume != AudioFader.audioVolumeMin) {
                return new Promise((resolve) => {
                    console.debug(
                        `AudioFader::fadeOut:currentMediaVolume:${currentMediaVolume}`,
                    );
                    this.onFadingChanged.emit(FadingMode.FadeOut);
                    return this.fade(
                        currentMediaVolume,
                        AudioFader.audioVolumeMin,
                        duration,
                    )
                        .catch(() => {
                            console.debug(`AudioFader::fadeOut:linear:aborted`);
                        })
                        .then(() => {
                            console.debug(`AudioFader::fadeOut:linear:ended`);
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
