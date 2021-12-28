import { Howl } from 'howler';

/** @class A fader for a howler instance
 * @remarks This transparently handles fading operations during playback.
 * The goal is to free the actual howler instance from fading handling, especially from delayed stop or pause calls from user-triggered fade-out operations.
 */
export class HowlerFader {
    /** @constructor
     * @param {Howl} howl - The howl sound (from howler.js) to act upon
     * @param {number} duration - The fading duration. Default is zero (no fade)
     * @param {boolean} applyFadeInOffset - Whether to apply the seek offset before fade-in operations, to compensate the fading duration.
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
    }
    sound: Howl;
    /** The fading duration in [milliseconds] */
    duration = 0;
    /** Whether to apply a seek offset before fade-in operations, to compensate the fading duration.*/
    applyFadeInOffset = true;

    /** Starts a fade-in for the currently playing track
     * @remarks A fade operation is only started when the duration is non-zero
     */
    fadeIn(): void {
        if (this.duration) {
            console.debug(`HowlerFader::fadeIn`);
            if (this.applyFadeInOffset) {
                this.applyPreFadeOffset();
            }
            this.sound.fade(0, 1, this.duration);

            //TODO remove this logging for production
            this.sound.once('fade', function () {
                console.debug(`HowlerFader::fadeOut:ended`);
            });
        }
    }

    /** Immediately cancel any running fade operation.
     * @remarks Cancel is only executed when the duration is non-zero

     */
    cancel(): void {
        if (this.duration) {
            console.debug(`HowlerFader::cancel`);
            const currentVolume = this.sound.volume();
            this.sound.fade(currentVolume, 0, 0);
        }
    }

    applyPreFadeOffset(): void {
        console.debug(`HowlerFader::applyPreFadeOffset:${this.duration}`);

        const time = this.sound.seek();
        const offset = this.duration / 1000;
        this.sound.seek(time - offset);
    }

    /** Returns a fade-out promise for the currently playing track
     * @remarks A fade operation is only started when the duration is non-zero
     */
    fadeOut(): Promise<void> {
        if (this.duration) {
            return new Promise((resolve, reject) => {
                try {
                    const currentVolume = this.sound.volume();
                    console.debug(
                        `HowlerFader::fadeOut:volume:${currentVolume}`,
                    );
                    if (currentVolume > 0) {
                        //Determine the required fade, based on the current volume
                        //(a fade-in could be currently running, requiring a partial fade only)
                        const requiredDuration = this.duration * currentVolume;

                        this.sound.fade(currentVolume, 0, requiredDuration);

                        this.sound.once('fade', function () {
                            //TODO remove this logging for production
                            console.debug(`HowlerFader::fadeOut:ended`);
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
            return Promise.resolve();
        }
    }
}
