import { v4 as uuidv4 } from 'uuid';

//TODO use a singleton timer method, instead one for each instance

/** @class A fader for an audio element instance.
 * @remarks This handles fade-in/out operations during playback, including a muted state.
 * The goal is to free the actual player from automatic fading handling.
 * Using this promise-based approach especially frees the using code from
 * using timers for calling delayed stop or pause operations after a fade operation.
 * @remarks Newly attempted fade operations are prevented during already ongoing fade operations. The ongoing
 * fade operation is however cancelled (and subsequently fades to min).
 * @remarks Also supports a master volume and a muted state that is applied on top of the fading volume changes.
 * @remarks Currently only supports a linear fade, with a constant gradient,
 * only determined by the predefined durations for a full-scale fade.
 * @remarks Fading is only actually executed for non-zero fading durations.
 * For zero fading durations, the call immediately returns with a resolved promise, without any call to a fade operation.
 * This can be used as a convenient way to skip fadings.
 */
export default class AudioFader {
    /** This is set to a fixed value, as a tradeoff between call frequency and smoothness
     * @devdoc This should be set to a value that produces small volume changes, that are barely audible
     */
    stepDuration = 16;

    /** Token for the currently running fade operation.
     * @remarks Allows an ongoing fading operation to determine whether it has been superseded
     * by a subsequent operation. This allows the first operation to reject the promise
     * and abandon the fade operation.
     */
    operationToken = '';

    /** The muted state */
    private _muted = false;

    /** @constructor
     * @param {HTMLAudioElement} audio - The audio element to act upon
     * @param {number} fadeInDuration - The fade-in duration. Default is 1000 (1 second)
     * @param {number} fadeOutDuration - The fade-out duration. Default is 500 (500 milliseconds)
     * @param {boolean} applyFadeInOffset - Whether to apply the seek offset before fade-in operations, to compensate the fading duration. (Default: true)
     * @param {number} masterVolume - The overall volume of the output. Can be used to control the output volume in addition to fadings. (Default: 1, representing full scale)
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
    ) {
        this.audio = audio;
        this.fadeInDuration = fadeInDuration;
        this.fadeOutDuration = fadeOutDuration;
        this.applyFadeInOffset = applyFadeInOffset;
        this.masterVolume = masterVolume;

        this.reset();
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
        const noMoreFading =
            this.fadeInDuration != 0 &&
            fadeInDuration === 0 &&
            this.fadeOutDuration != 0 &&
            fadeOutDuration === 0;
        this.fadeInDuration = fadeInDuration;
        this.fadeOutDuration = fadeOutDuration;
        this.applyFadeInOffset = applyFadeInOffset;

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
    applyFadeInOffset = true;

    /** The master volume level */
    masterVolume = 1;

    /** The minimum audio volume level
     * @remarks  -90dbFS Amplitude
     */
    public static audioVolumeMin = 0.00003162;
    /** The maximum audio volume level */
    public static audioVolumeMax = 1;

    /** Resets the token for the currently running fade operation.
     * @remarks Allows operations to cancel themselves in favor of a subsequent operation.
     */
    cancel(): void {
        this.operationToken = '';
    }

    /** If there is a currently running fade operation, reset the token.
     * @returns Whether an operation was ongoing
     */
    hadToCancel(): boolean {
        if (this.operationToken) {
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
        if (this.fadeInDuration || this.fadeOutDuration) {
            this.setAudioVolume(AudioFader.audioVolumeMin);
        } else {
            this.setAudioVolume(this.masterVolume);
        }
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
        this.setAudioVolume(this.getMasterAudioVolume());
    }

    /** Sets the audio volume to the given value.
     * @remarks Applies a range check for the allowed maximum range (0..1)
     */
    private setAudioVolume(volume: number): void {
        const limitedVolume = Math.min(
            AudioFader.audioVolumeMax,
            Math.max(AudioFader.audioVolumeMin, volume),
        );
        this.audio.volume = limitedVolume;
    }

    /** Gets the master audio volume, with the possible muted state observed
     * @returns A value between 0 (zero) and 1 (representing full scale), while observing the muted state.
     */
    private getMasterAudioVolume(): number {
        if (!this.muted) {
            return this.masterVolume;
        } else {
            return AudioFader.audioVolumeMin;
        }
    }

    /** Sets the master audio volume
     * @remarks The value is applied immediately, without any fading, with the possible muted state observed
     * @param {number} volume - A value between 0 (zero) and 1 (representing full scale)
     */
    public setMasterAudioVolume(volume: number): void {
        const fadingRatio = this.getCurrentAudioVolume() / this.masterVolume;
        this.masterVolume = volume;
        this.setAudioVolume(this.getMasterAudioVolume() * fadingRatio);
    }

    /** Gets the current audio volume, with a boundary check to make sure
     * it's a valid number between minAudioLevel and maxAudioLevel, inclusive.
     * If not valid, an average level is returned as a compromise. */
    private getCurrentAudioVolume(): number {
        let currentVolume = this.audio.volume;

        if (
            currentVolume < AudioFader.audioVolumeMin ||
            currentVolume > AudioFader.audioVolumeMax ||
            !isFinite(currentVolume)
        ) {
            console.warn(
                `AudioFader::getCurrentAudioVolume:Volume out of bounds. Returning average value`,
            );
            currentVolume =
                (AudioFader.audioVolumeMin + AudioFader.audioVolumeMax) / 2;
        }
        return currentVolume;
    }

    /** Returns a linear fade-in promise for the currently playing track
     * @remarks The sound is faded to the master volume audio level.
     * A pre-fade offset is applied, when configured
     * An actual fade operation is only started when
     * - the duration is non-zero and
     * - no previous fade operation is ongoing
     * otherwise
     * - the promise is immediately resolved.
     */
    fadeIn(): Promise<void> {
        if (this.hadToCancel()) {
            return Promise.resolve();
        } else {
            if (this.fadeInDuration) {
                return new Promise((resolve) => {
                    const currentVolume = this.getCurrentAudioVolume();
                    if (currentVolume < this.getMasterAudioVolume()) {
                        return this.fade(
                            currentVolume,
                            this.getMasterAudioVolume(),
                            this.fadeInDuration,
                        )
                            .catch(() => {
                                console.debug(
                                    `AudioFader::fadeIn:linear:aborted`,
                                );
                            })
                            .then(() => {
                                console.debug(
                                    `AudioFader::fadeIn:linear:ended`,
                                );
                            })
                            .finally(() => {
                                resolve();
                            });
                    } else {
                        resolve(); //immediately
                    }
                });
            } else {
                //nothing to fade
                this.setAudioVolume(this.getMasterAudioVolume());
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
            this.setAudioVolume(from);

            //Start a repeated call sequence to gradually adjust the volume
            const stepSize = to - from;
            const endTime = new Date().getTime() + duration;
            const currentOperationToken = uuidv4();
            this.operationToken = currentOperationToken;
            const clearIntervalId = setInterval(() => {
                const now = new Date().getTime();
                //Check whether it's time to end the fade
                //(By a subsequent operation)
                if (this.operationToken != currentOperationToken) {
                    clearInterval(clearIntervalId);
                    this.cancel();
                    const message =
                        'AudioFader::Linear fade aborted due to cancelling or a subsequent fade operation.';
                    console.warn(message);
                    //Set exactly to the expected end volume, starting from there for the next fade
                    this.setAudioVolume(to);
                    reject(message);
                    return;
                }

                //(by time is up)
                if (now >= endTime) {
                    clearInterval(clearIntervalId);
                    this.cancel();
                    //Set exactly to the expected end volume, in case it was missed slightly
                    this.setAudioVolume(to);
                    resolve();
                    return;
                }

                //continue fading
                const remainingTime = endTime - now;
                const passedTime = duration - remainingTime;
                const stepTarget = from + (stepSize / duration) * passedTime;
                this.setAudioVolume(stepTarget);
            }, this.stepDuration);
        });
    }

    /** Returns a linear fade-out promise for the currently playing track
     * @remarks The sound is faded to the minimum audio level.
     * An actual fade operation is only started when
     * - the duration is non-zero and
     * - no previous fade operation is ongoing
     * otherwise
     * - a fade with duration zero is started and the promise is immediately resolved.
     */
    fadeOut(): Promise<void> {
        if (this.hadToCancel()) {
            return Promise.resolve();
        } else {
            if (this.fadeOutDuration) {
                return new Promise((resolve) => {
                    const currentVolume = this.getCurrentAudioVolume();
                    console.debug(
                        `AudioFader::fadeOut:volume:${currentVolume}`,
                    );

                    return this.fade(
                        currentVolume,
                        AudioFader.audioVolumeMin,
                        this.fadeOutDuration,
                    )
                        .catch(() => {
                            console.debug(`AudioFader::fadeOut:linear:aborted`);
                        })
                        .then(() => {
                            console.debug(`AudioFader::fadeOut:linear:ended`);
                        })
                        .finally(() => {
                            resolve();
                        });
                });
            } else {
                //nothing to fade
                this.setAudioVolume(AudioFader.audioVolumeMin);
                return Promise.resolve();
            }
        }
    }
}
