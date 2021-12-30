import { Howl } from 'howler';

/** A set of fading curves */
export enum Curve {
    logarithmic = 'logarithmic',
    linear = 'linear',
}

/** @class A fader for a howl (from howler.js) instance
 * @remarks This transparently handles fading operations on a howl during playback.
 * The goal is to free the actual howl/howler instance from fading handling.
 * Using this promise-based approach especially frees the using code from
 * using timers for calling delayed stop or pause operations after a fade operation.
 * @remarks Fading is only actually executed for non-zero fading durations.
 * For zero fading durations, the call immediately returns with a resolved promise, without any call to Howler's fade operation.
 */
export default class HowlerFader {
    logLevels = [
        1.0 /*          0dB                                                                       */,
        0.5 /*         -6dB                                                                       */,
        0.25 /*       -12dB                                                                       */,
        0.125 /*      -18dB                                                                       */,
        0.0625 /*     -24dB                                                                       */,
        0.03125 /*    -30dB                                                                       */,
        0.015625 /*   -36dB                                                                       */,
        0.0078125 /*  -42dB                                                                       */,
        0.00390625 /* -48dB                                                                       */,
        0.001953125 /*-54dB                                                                       */,
        0.000976562 /*-60dB                                                                       */,
        0.000488281 /*-66dB                                                                       */,
        0.000244141 /*-72dB                                                                       */,
        0.00012207 /* -78dB                                                                       */,
        0.000061035 /*-84dB                                                                       */,
        0.000030518 /*-90dB                                                                       */,
        0.000015259 /*-96dB (equals the 16-bit compact disc theoretical undithered dynamic range) */,
    ];

    /** @constructor
     * @param {Howl} howl - The howl sound (from howler.js) to act upon
     * @param {number} duration - The fading duration. Default is zero (no fade operation called)
     * @param {boolean} applyFadeInOffset - Whether to apply the seek offset before fade-in operations, to compensate the fading duration. (Default: true)
     * @param {Curve} curve - The function curve to apply for the fade (Default: linear).
     */
    constructor(
        howl: Howl,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        duration: number = 0,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        applyFadeInOffset: boolean = true,

        curve: Curve = Curve.linear,
    ) {
        this.sound = howl;
        this.duration = duration;
        this.applyFadeInOffset = applyFadeInOffset;
        this.curve = curve;
    }
    /** The howler.js howl to act upon */
    sound: Howl;
    /** The fading duration in [milliseconds] */
    duration = 0;
    /** Whether to apply a seek offset before fade-in operations, to compensate the fading duration.*/
    applyFadeInOffset = true;
    /** The function curve to apply for the fade */
    curve = Curve.linear;

    /** Immediately cancel any running fade operation.
     * @remarks Cancel is only executed when the duration (of prefious fades) is non-zero

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

    /** Returns a linear fade-in promise for the currently playing track
     * @remarks The sound is faded to full scale.
     * An actual fade operation is only started when
     * - the duration is non-zero and
     * - the current volume is also non-full-scale
     * otherwise
     * - a fade with duration zero is started and the promise is immediately resolved.
     * @devdoc Howler only supports linear fade operations
     */
    fadeIn(): Promise<void> {
        if (this.duration) {
            return new Promise((resolve, reject) => {
                try {
                    const currentVolume = 0; //always start fade-in from zero
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

                        if (this.curve === Curve.linear) {
                            return this.fade(
                                currentVolume,
                                1,
                                requiredDuration,
                            ).then(() => {
                                //TODO remove this logging for production
                                console.debug(
                                    `HowlerFader::fadeIn:linear:ended`,
                                );
                                resolve();
                            });
                        } else if (this.curve === Curve.logarithmic) {
                            return this.fadeLog(
                                currentVolume,
                                1,
                                requiredDuration,
                            ).then(() => {
                                //TODO remove this logging for production
                                console.debug(
                                    `HowlerFader::fadeIn:logarithmic:ended`,
                                );
                                resolve();
                            });
                        }
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

    /** Returns a logarithmic fade promise for the currently playing track
     * @remarks This just emulates a logarithmic fade by repetitively wrapping
     * this faders's own promise-based linear fade operation with multiple linear steps.
     * @devdoc Howler only supports linear fade operations
     */
    fadeLog(
        from: number,
        to: number,
        duration: number,
        id?: number,
    ): Promise<void> {
        if (this.duration) {
            return new Promise((resolve, reject) => {
                try {
                    //Calculate the steps
                    const stepCount = this.logLevels.length;
                    const stepDuration = duration / stepCount;
                    console.debug(
                        'HowlerFader::chain stepDuration ',
                        stepDuration,
                    );

                    //TODO example for a 4-step fade-in
                    const levelDiff = to - from;

                    const levelSteps = new Array<number>();
                    levelSteps.push(from + levelDiff * this.logLevels[0]);
                    levelSteps.push(from + levelDiff * this.logLevels[1]);
                    levelSteps.push(from + levelDiff * this.logLevels[2]);
                    levelSteps.push(from + levelDiff * this.logLevels[3]);
                    levelSteps.push(from + levelDiff * this.logLevels[4]);

                    //Start at zero
                    this.sound.fade(0, 0, 0, id);
                    this.fadeBySteps(stepDuration, levelSteps, resolve, id);
                } catch (err) {
                    reject('HowlerFader::Logarithmic fade failed.');
                }
            });
        } else {
            //nothing to fade
            return Promise.resolve();
        }
    }
    fadeBySteps(
        stepDuration: number,
        levelSteps: number[],
        resolve: (value: void | PromiseLike<void>) => void,
        id?: number,
    ) {
        const thisStepLevel = levelSteps.pop();

        if (thisStepLevel) {
            const currentVolume = this.sound.volume();
            console.debug(
                `HowlerFader::fadeBySteps:currentVolume:${currentVolume};thisStepLevel:${thisStepLevel}`,
            );
            this.sound.fade(currentVolume, thisStepLevel, stepDuration, id);
            //Schedule the next step
            window.setTimeout(() => {
                this.fadeBySteps(stepDuration, levelSteps, resolve, id);
            }, stepDuration);
        } else {
            resolve();
            console.debug('HowlerFader::fadeBySteps:resolved');
        }
    }

    /** Returns a logarithmic fade promise for the currently playing track
     * @remarks This just emulates a logarithmic fade by repetitively wrapping
     * this faders's own promise-based linear fade operation with multiple linear steps.
     * @devdoc Howler only supports linear fade operations
     */
    fadeLog3(
        from: number,
        to: number,
        duration: number,
        id?: number,
    ): Promise<void> {
        if (this.duration) {
            return new Promise((resolve, reject) => {
                try {
                    //Calculate the steps
                    //const stepCount = 20; //this.logLevels.length;
                    const stepDuration = duration; /// stepCount;
                    console.debug('chain stepDuration ', stepDuration);

                    //TODO example for a 4-step fade-in
                    const levelDiff = to - from;
                    const from1 = from + levelDiff * this.logLevels[4];
                    const to1 = from + levelDiff * this.logLevels[3];

                    const from2 = to1;
                    const to2 = from + levelDiff * this.logLevels[2];

                    const from3 = to2;
                    const to3 = from + levelDiff * this.logLevels[1];

                    const from4 = to3;
                    const to4 = from + levelDiff * this.logLevels[0];

                    console.debug('chain step 1 ');
                    this.fade(from1, to1, stepDuration, id);
                    window.setTimeout(() => {
                        console.debug('chain step 2 ');
                        this.fade(from2, to2, stepDuration, id);
                    }, stepDuration * 1);
                    window.setTimeout(() => {
                        console.debug('chain step 3 ');
                        this.fade(from3, to3, stepDuration, id);
                    }, stepDuration * 2);
                    window.setTimeout(() => {
                        console.debug('chain step 4 ');
                        this.fade(from4, to4, stepDuration, id);
                    }, stepDuration * 3);
                    window.setTimeout(() => {
                        resolve();
                        console.debug('chain step resolved ');
                    }, stepDuration * 4);
                } catch (err) {
                    reject('Logarithmic fade failed.');
                }
            });
        } else {
            //nothing to fade
            return Promise.resolve();
        }
    }

    /** Returns a logarithmic fade promise for the currently playing track
     * @remarks This just emulates a logarithmic fade by repetitively wrapping
     * this faders's own promise-based linear fade operation with multiple linear steps.
     * @devdoc Howler only supports linear fade operations
     */
    fadeLogOld(
        from: number,
        to: number,
        duration: number,
        id?: number,
    ): Promise<void> {
        if (this.duration) {
            return new Promise((resolve, reject) => {
                try {
                    //Calculate the steps
                    //const stepCount = 20; //this.logLevels.length;
                    const stepDuration = duration; /// stepCount;
                    console.debug('chain stepDuration ', stepDuration);
                    const chain = Promise.resolve();

                    //Does not work, but see https://medium.com/developer-rants/running-promises-in-a-loop-sequentially-one-by-one-bd803181b283
                    // for (let i = 0; i < stepCount; i++) {
                    //     chain = chain
                    //         .then(() => {
                    //             this.fade(from, to, stepDuration, id);
                    //         })
                    //         .then(() => {
                    //             console.debug('chain step ', i);
                    //             //then do the next step
                    //         });
                    // }
                    // chain = chain.then(() => resolve());

                    //TODO example for a 4-step fade-in
                    const levelDiff = to - from;
                    const from1 = from;
                    const to1 = from + levelDiff * this.logLevels[4];

                    const from2 = to1;
                    const to2 = from + levelDiff * this.logLevels[3];

                    const from3 = to2;
                    const to3 = from + levelDiff * this.logLevels[2];

                    const from4 = to3;
                    const to4 = from + levelDiff * this.logLevels[1];

                    const from5 = to4;
                    const to5 = from + levelDiff * this.logLevels[0];

                    return chain.then(() => {
                        console.debug('chain step 1 ');
                        this.fade(from1, to1, stepDuration, id).then(() => {
                            console.debug('chain step 2 ');
                            this.fade(from2, to2, stepDuration, id).then(() => {
                                console.debug('chain step 3 ');
                                this.fade(from3, to3, stepDuration, id).then(
                                    () => {
                                        console.debug('chain step 4 ');
                                        this.fade(
                                            from4,
                                            to4,
                                            stepDuration,
                                            id,
                                        ).then(() => {
                                            console.debug('chain step 5 ');
                                            this.fade(
                                                from5,
                                                to5,
                                                stepDuration,
                                                id,
                                            ).then(() => {
                                                console.debug(
                                                    'chain step resolved ',
                                                );
                                                resolve();
                                            });
                                        });
                                    },
                                );
                            });
                        });
                    });
                } catch (err) {
                    reject('Logarithmic fade failed.');
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
                    const currentVolume = this.sound.volume();
                    console.debug(
                        `HowlerFader::fadeOut:volume:${currentVolume}`,
                    );
                    if (currentVolume > 0) {
                        //Determine the required fade, based on the current volume
                        //(an existing fade-out could be currently running, requiring a partial fade only)
                        const requiredDuration = this.duration * currentVolume;

                        if (this.curve === Curve.linear) {
                            return this.fade(
                                currentVolume,
                                0,
                                requiredDuration,
                            ).then(() => {
                                //TODO remove this logging for production
                                console.debug(
                                    `HowlerFader::fadeOut:linear:ended`,
                                );
                                resolve();
                            });
                        } else if (this.curve === Curve.logarithmic) {
                            return this.fadeLog(
                                currentVolume,
                                0,
                                requiredDuration,
                            ).then(() => {
                                //TODO remove this logging for production
                                console.debug(
                                    `HowlerFader::fadeOut:logarithmic:ended`,
                                );
                                resolve();
                            });
                        }
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
