import { Howl } from 'howler';

/** @class A fader for a howl (from howler.js) instance
 * @remarks This transparently handles fading operations on a howl during playback.
 * The goal is to free the actual howl/howler instance from fading handling.
 * Using this promise-based approach especially frees the using code from
 * using timers for calling delayed stop or pause operations after a fade operation.
 * @remarks Fading is only actually executed for non-zero fading durations.
 * For zero fading durations, the call immediately returns with a resolved promise, without any call to Howler's fade operation.
 */
export default class HowlerFader {
    /** @constructor
     * @param {Howl} howl - The howl sound (from howler.js) to act upon
     * @param {number} duration - The fading duration. Default is zero (no fade operation called)
     * @param {boolean} applyFadeInOffset - Whether to apply the seek offset before fade-in operations, to compensate the fading duration. (Default: true)
     */
    constructor(
        howl: Howl,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        duration: number = 0,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        applyFadeInOffset: boolean = true,
    ) {
        this.sound = howl;
        this.duration = duration;
        this.applyFadeInOffset = applyFadeInOffset;

        //Initialize by setting the fader level to initially zero
        this.cancel();
    }
    /** The howler.js howl to act upon */
    sound: Howl;
    /** The fading duration in [milliseconds] */
    duration = 0;
    /** Whether to apply a seek offset before fade-in operations, to compensate the fading duration.*/
    applyFadeInOffset = true;
    /** The minimal audio level (avoid zero due to calculation problems) */
    minAudioLevel = 0.01;

    /** Immediately cancel any running fade operation, by immediately fading to the minimum (if the volume is currently non-minimum).
     * @remarks Cancel is only executed when the duration (of previous fades) is non-zero
     */
    cancel(): void {
        if (this.duration) {
            console.debug(`HowlerFader::cancel`);
            //TODO maybe only fade when the level is different???
            const currentVolume = this.getCurrentVolume();
            if (currentVolume != this.minAudioLevel) {
                this.sound.fade(currentVolume, this.minAudioLevel, 0);
            }
        }
    }

    /** Gets the current volume, with a boundary check to make sure, it's a valid number between minAudioLevel and 1, inclusive.
     * If not valid, 0.5 is returned as a compromise. */
    getCurrentVolume(): number {
        let currentVolume = this.sound.volume();
        console.debug(`HowlerFader::cancel:currentVolume:${currentVolume}`);

        if (
            currentVolume < this.minAudioLevel ||
            currentVolume > 1 ||
            isNaN(currentVolume)
        ) {
            currentVolume = 0.5;
        }
        return currentVolume;
    }

    applyPreFadeOffset(): void {
        console.debug(`HowlerFader::applyPreFadeOffset:${this.duration}`);

        const time = this.sound.seek();
        const offset = this.duration / 1000;
        this.sound.seek(time - offset);
    }

    /** Returns a linear fade-in promise for the currently playing track
     * @remarks The sound is faded to full scale.
     * An actual fade operation is only started when
     * - the duration is non-zero and
     * - the current volume is also non-full-scale
     * otherwise
     * - the promise is immediately resolved.
     * @devdoc Howler only supports linear fade operations
     */
    fadeIn(): Promise<void> {
        if (this.duration) {
            return new Promise((resolve, reject) => {
                try {
                    const currentVolume = this.minAudioLevel; //always start fade-in from minimum
                    console.debug(
                        `HowlerFader::fadeIn:volume:${currentVolume}`,
                    );
                    if (this.applyFadeInOffset) {
                        this.applyPreFadeOffset();
                    }
                    if (currentVolume < 1) {
                        //Determine the required fade, based on the current volume
                        //(an existing fade-out could be currently running, requiring a partial fade only)
                        const requiredDuration =
                            this.duration * (1 - currentVolume);

                        return this.fade(
                            currentVolume,
                            1,
                            requiredDuration,
                        ).then(() => {
                            //TODO remove this logging for production
                            console.debug(`HowlerFader::fadeIn:linear:ended`);
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
     * @remarks This just wraps howler's own fade operation with a promise.
     * @devdoc Howler only supports linear fade operations
     */
    fade(
        from: number,
        to: number,
        duration: number,
        id?: number,
    ): Promise<void> {
        if (this.duration) {
            return new Promise((resolve, reject) => {
                try {
                    this.sound.fade(from, to, duration, id);
                    this.sound.once('fade', function () {
                        resolve();
                    });
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
     * @remarks The sound is faded to zero.
     * An actual fade operation is only started when
     * - the duration is non-zero and
     * - the current volume is also non-zero
     * otherwise
     * - a fade with duration zero is started and the promise is immediately resolved.
     * @devdoc Howler only supports linear fade operations
     */
    fadeOut(): Promise<void> {
        if (this.duration) {
            return new Promise((resolve, reject) => {
                try {
                    const currentVolume = this.getCurrentVolume();
                    console.debug(
                        `HowlerFader::fadeOut:volume:${currentVolume}`,
                    );
                    if (currentVolume > 0) {
                        //Determine the required fade, based on the current volume
                        //(an existing fade-in could be currently running, requiring a partial fade only)
                        const requiredDuration = this.duration * currentVolume;

                        return this.fade(
                            currentVolume,
                            this.minAudioLevel,
                            requiredDuration,
                        ).then(() => {
                            //TODO remove this logging for production
                            console.debug(`HowlerFader::fadeOut:linear:ended`);
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
