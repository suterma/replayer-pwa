/** @interface Defines an audio fader.
 * @remarks This defines audio fade-in/out operations, for use during playback, including a muted state.
 * The goal is to free the actual player from fading handling.
 * Using this promise-based approach especially frees the using code from
 * using timers for calling delayed stop or pause operations after a fade operation.
 * @remarks Newly attempted fade operations are prevented during already ongoing fade operations. The ongoing
 * fade operation is however cancelled (and subsequently fades to min).
 * @remarks Also supports a master volume and a muted state that is applied on top of the fading volume changes.
 * @remarks Fading is only actually executed for non-zero fading durations.
 * For zero fading durations, the call immediately returns with a resolved promise, without any call to a fade operation.
 * This can be used as a convenient way to skip fadings.
 */
export interface IAudioFader {
    //TODO later use media element instead of autio element

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
        fadeInDuration: number,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        fadeOutDuration: number,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        applyFadeInOffset: boolean,
    ): void;

    /** Cancels the currently running fade operation.
     */
    cancel(): void;

    /** Sets the volume to the initial value.
     */
    reset(): void;

    /** Gets the fading state.
     */
    get fading(): boolean;

    /** Gets the muted state.
     */
    get muted(): boolean;

    /** Sets the muted state.
     */
    set muted(value: boolean);

    /** Sets the master audio volume
     * @remarks The value is applied immediately, without any fading, with the possible muted state observed
     * @param {number} volume - A value between 0 (zero) and 1 (representing full scale)
     */
    setMasterAudioVolume(volume: number): void;

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
