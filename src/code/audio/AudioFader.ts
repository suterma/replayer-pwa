/** @class A fader for an audio element instance
 * @remarks This transparently handles fading operations during playback.
 * The goal is to free the actual player from fading handling.
 * Using this promise-based approach especially frees the using code from
 * using timers for calling delayed stop or pause operations after a fade operation.
 * @remarks Fading is only actually executed for non-zero fading durations.
 * For zero fading durations, the call immediately returns with a resolved promise, without any call to a fade operation.
 */
export default class AudioFader {
    /** @constructor
     * @param {HTMLAudioElement} audio - The audio elenent to act upon
     * @param {number} fadeInDuration - The fade-in duration. Default is 1000 (1 second)
     * @param {number} fadeOutDuration - The fade-out duration. Default is 500 (500 milliseconds)
     * @param {boolean} applyFadeInOffset - Whether to apply the seek offset before fade-in operations, to compensate the fading duration. (Default: true)
     */
    constructor(
        audio: HTMLAudioElement,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        fadeInDuration: number = 1000,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        fadeOutDuration: number = 500,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        applyFadeInOffset: boolean = true,
    ) {
        this.audio = audio;
        this.fadeInDuration = fadeInDuration;
        this.fadeOutDuration = fadeOutDuration;
        this.applyFadeInOffset = applyFadeInOffset;

        //Initialize by setting the fader level to the initial value
        this.cancel();
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
    /** The minimum audio level */
    minAudioLevel = 0;
    /** The maximum audio level */
    maxAudioLevel = 1;

    /** Immediately cancel any running fade operation.
     * @remarks This immediately fades to the initial value.
     * When a non-zero fading duration is set, this is the minimum value (finish a possible fade-out/prepare for the next fade-in).
     * When a zero fading duration is set, this is the maximum value (effectively remove any fade)
     */
    cancel(): void {
        if (this.fadeInDuration || this.fadeOutDuration) {
            console.debug(`AudioFader::cancel:toMinimum`);
            const currentVolume = this.getCurrentVolume();
            if (currentVolume != this.minAudioLevel) {
                //TODO                 this.audio.fade(currentVolume, this.minAudioLevel, 0);
            }
        } else {
            console.debug(`HowlerFader::cancel:toMaximum`);
            const currentVolume = this.getCurrentVolume();
            if (currentVolume != this.maxAudioLevel) {
                //TODO                 this.audio.fade(currentVolume, this.maxAudioLevel, 0);
            }
        }
    }

    /** Gets the current volume, with a boundary check to make sure
     * it's a valid number between minAudioLevel and maxAudioLevel, inclusive.
     * If not valid, an average level is returned as a compromise. */
    getCurrentVolume(): number {
        let currentVolume = this.audio.volume;
        console.debug(
            `AudioFader::getCurrentVolume:currentVolume:${currentVolume}`,
        );

        if (
            currentVolume < this.minAudioLevel ||
            currentVolume > this.maxAudioLevel ||
            isNaN(currentVolume)
        ) {
            currentVolume = (this.minAudioLevel + this.maxAudioLevel) / 2;
        }
        return currentVolume;
    }

    /** Applies an offset to compensate fade-in durations */
    applyPreFadeInOffset(): void {
        const time = this.audio.currentTime;
        const offset = this.fadeInDuration / 1000;
        const target = time - offset;
        console.debug(
            `AudioFader::applyPreFadeInOffset:by:${this.fadeInDuration};from time:${time}; to target:${target}`,
        );
        this.audio.currentTime = target;
    }

    /** Returns a linear fade-in promise for the currently playing track
     * @remarks The sound is faded to the maximum audio level.
     * A pre-fade offset is applied, when configured
     * An actual fade operation is only started when
     * - the duration is non-zero and
     * - the current volume is also non-maximum
     *
     * otherwise
     * - the promise is immediately resolved.
     * @devdoc Howler only supports linear fade operations
     */
    fadeIn(): Promise<void> {
        if (this.fadeInDuration) {
            return new Promise((resolve, reject) => {
                try {
                    if (this.applyFadeInOffset) {
                        this.applyPreFadeInOffset();
                    }

                    const currentVolume = this.minAudioLevel; //always start fade-in from minimum
                    if (currentVolume < this.maxAudioLevel) {
                        //Determine the required fade, based on the current volume
                        //(an existing fade-out could be currently running, requiring a partial fade only)
                        const requiredDuration =
                            this.fadeInDuration *
                            (this.maxAudioLevel - currentVolume);

                        return this.fade(
                            currentVolume,
                            this.maxAudioLevel,
                            requiredDuration,
                        ).then(() => {
                            console.debug(`AudioFader::fadeIn:linear:ended`);
                            resolve();
                        });
                    } else {
                        resolve(); //immediately
                    }
                } catch (err) {
                    reject('Fade-in failed.');
                }
            });
        } else {
            //nothing to fade
            return Promise.resolve();
        }
    }

    /** Returns a linear fade promise for the currently playing track
     * @devdoc This currently only supports linear fade operations
     */
    fade(from: number, to: number, duration: number): Promise<void> {
        if (duration) {
            return new Promise((resolve, reject) => {
                try {
                    console.debug(
                        `AudioFader::fading for:${this.fadeInDuration};from:${from}; to:${to}`,
                    );

                    //TODO implement
                    // this.sound.fade(from, to, duration, id);
                    // this.sound.once('fade', function () {
                    //     resolve();
                    // });
                    //TODO implement (currently just waits duration time)
                    setTimeout(() => {
                        resolve();
                    }, duration);
                } catch (err) {
                    reject('HowlerFader::Linear fade failed.');
                }
            });
        } else {
            //nothing to fade
            return Promise.resolve();
        }
    }

    /** Returns a linear fade-out promise for the currently playing track
     * @remarks The sound is faded to the minimum audio level.
     * An actual fade operation is only started when
     * - the duration is non-zero and
     * - the current volume is also non-minimum
     *
     * otherwise
     * - a fade with duration zero is started and the promise is immediately resolved.
     * @devdoc Howler only supports linear fade operations
     */
    fadeOut(): Promise<void> {
        if (this.fadeOutDuration) {
            return new Promise((resolve, reject) => {
                try {
                    const currentVolume = this.getCurrentVolume();
                    console.debug(
                        `AudioFader::fadeOut:volume:${currentVolume}`,
                    );
                    if (currentVolume > this.minAudioLevel) {
                        //Determine the required fade, based on the current volume
                        //(an existing fade-in could be currently running, requiring a partial fade only)
                        const requiredDuration =
                            this.fadeOutDuration * currentVolume;

                        return this.fade(
                            currentVolume,
                            this.minAudioLevel,
                            requiredDuration,
                        ).then(() => {
                            console.debug(`AudioFader::fadeOut:linear:ended`);
                            resolve();
                        });
                    } else {
                        resolve(); //immediately
                    }
                } catch (err) {
                    reject('Fade-out failed.');
                }
            });
        } else {
            //nothing to fade
            return Promise.resolve();
        }
    }
}
