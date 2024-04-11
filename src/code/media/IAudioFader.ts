/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import { SubEvent } from 'sub-events';

/** @interface Defines an audio fader. This fader supports two concepts:
 * A master volume, that emulates a set, overall audio level, and
 * independent fading and mute operations, which internally
 * control the actually set audio level on the media player.
 * @remarks Visual fading indication like progress bars or brightness changes
 * must be implemented elsewhere, but can use the provided onFadingChanged event.
 * @remarks This defines audio fade-in/out operations, for use during playback, including a muted state.
 * The goal is to free the actual player from fading handling.
 * Using this promise-based approach especially frees the using code from
 * using timers for calling delayed stop or pause operations after a fade operation.
 * @remarks Newly attempted fade operations are prevented during already ongoing fade operations. The ongoing
 * fade operation is however cancelled (and subsequently fades to min).
 * @remarks Also supports a master volume and a muted state that is applied on top of the fading volume changes.
 * @remarks Fading is only actually executed for non-zero fading durations.
 * For zero fading durations, the call immediately returns with a resolved promise, without any call to a fade operation.
 * This can be used as a convenient way to skip fadings (thus e.g.
 * immediately change the playback state).
 */
export interface IAudioFader {
    //TODO couldnt we just use getter/setters with properties???
    /** Updates the current settings.
     * @remarks The settings will be used for the next fade.
     * However, when the new duration is zero (no fade),
     * the cancel operation is immediately called, resetting the volume to the initial value for this case.
     * @param {number} fadeInDuration - The fade-in duration. Default is 1000 (1 second)
     * @param {number} fadeOutDuration - The fade-out duration. Default is 500 (500 milliseconds)
     * @param {boolean} preRollDuration - The amount of time to the seek backwards before a play operation. (Default: zero)
     * @param {boolean} addFadeInPreRoll - Whether to apply an additional seek offset before fade-in operations, to compensate the fading duration. (Default: true)
     */
    updateSettings(
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        fadeInDuration: number,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        fadeOutDuration: number,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        preRollDuration: number,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        addFadeInPreRoll: boolean,
    ): void;

    /** Cancels the currently running fade operation.
     */
    cancel(): void;

    /** Sets the volume to the initial value.
     */
    reset(): void;

    /** Destroys the instance by releasing resources.
     */
    destroy(): void;

    /** Gets whether fading is enabled.
     */
    get isFadingEnabled(): boolean;

    /** Sets whether fading is enabled.
     */
    set isFadingEnabled(enabled: boolean);

    /** Gets whether pre-roll is enabled.
     */
    get isPreRollEnabled(): boolean;

    /** Sets whether pre-roll is enabled.
     */
    set isPreRollEnabled(enabled: boolean);

    /** Gets the fade-in duration in [milliseconds].
     */
    get fadeInDuration(): number;

    /** Gets the fade-out duration in [milliseconds].
     */
    get fadeOutDuration(): number;

    /** Whether to apply an additional seek offset before fade-in operations, to compensate the fading duration.
     */
    get addFadeInPreRoll(): boolean;

    /** Gets the amount of time to the seek backwards before a play operation.
     */
    get preRollDuration(): number;

    /** Sets the amount of time to the seek backwards before a play operation.
     */
    set preRollDuration(duration: number);

    /** Gets the fading state, which is true for any kind of fading.
     */
    get fading(): boolean;

    /** Gets the muted state.
     */
    get muted(): boolean;

    /** Sets the muted state.
     */
    set muted(value: boolean);

    /** Sets the master audio volume.
     * @remarks The new value is only applied if it actually changes, after limitation.
     * The 'onMasterVolumeChange' is also only emitted on actual changes.
     * @remarks A changed value is applied immediately, without any fading, with the possible muted state observed
     * @param {number} volume - A value between 0 (zero, will get limited to the minimum level) and 1 (representing full scale)
     * @remarks Limits the minimum level at -90dB Full Scale
     * @returns The new, possibly limited, master audio volume
     */
    setVolume(volume: number): number;

    /** Decreases the master audio volume level by rougly 3dB
     * @remarks Applies some limitation on the upper and lower end of the range
     * @returns The new, possibly limited, master audio volume
     */
    volumeDown(): number;

    /**Increases the master audio volume level by rougly 3dB
     * @remarks Applies some limitation on the upper and lower end of the range
     * @returns The new, possibly limited, master audio volume
     */
    volumeUp(): number;

    /** Emits a changed master volume state.
     * @param {number} volume - the changed master volume
     */
    readonly onVolumeChanged: SubEvent<number>;

    /** Emits a changed muted state.
     * @param {boolean} muted - the changed muted state
     */
    readonly onMutedChanged: SubEvent<boolean>;

    /** Emits a changed fading state.
     * @param {FadingMode} fading - kind of fading operation that is currently ongoing
     */
    readonly onFadingChanged: SubEvent<FadingMode>;

    /** Returns a fade-in promise for the currently playing track
     * @remarks The sound is faded to the master volume audio level.
     * A pre-fade offset is applied, when configured
     * An actual fade operation is only started when
     * - the set duration is non-zero and
     * - no previous fade operation is ongoing
     * otherwise
     * - the promise is immediately resolved.
     */
    fadeIn(): Promise<void>;

    /** Returns a fade-out promise for the currently playing track
     * @remarks The sound is faded to the minimum audio level.
     * An actual fade operation is only started when
     * - the set duration is non-zero and
     * - no previous fade operation is ongoing
     * - the immediate parameter is not set to true
     * otherwise
     * - a fade with duration zero is started and the promise is immediately resolved.
     * @param immediate - When set to true, the fade operation is done with duration zero.
     */
    fadeOut(immediate?: boolean): Promise<void>;
}
/** A fading mode
 * */
export enum FadingMode {
    None = 'None',
    FadeIn = 'FadeIn',
    FadeOut = 'FadeOut',
}
