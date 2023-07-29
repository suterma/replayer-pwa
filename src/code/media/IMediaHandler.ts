import { SubEvent } from 'sub-events';

/** @interface Defines a media handler.
 *  This handles transport, loop and volume operations for media sources like e.g. HTML media elements.
 */
export interface IMediaHandler {
    // --- configuration and update ---

    /** A unique identifier for this handler.
     * @remarks To work correctly, this identifier must be unique among all currently existing handlers.
     *  Best, to make it universally unique by using a UUID.
     */
    readonly id: string;

    // --- fading ---

    /** Updates the current fading settings.
     * @remarks The settings will be used for the next fade.
     * However, when the new duration is zero (no fade),
     * the cancel operation is immediately called, resetting the volume to the initial value for this case.
     */
    updateFadingSettings(
        fadeInDuration: number,
        fadeOutDuration: number,
        applyFadeInOffset: boolean,
    ): void;

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

    /** Returns a fade-in promise.
     * @remarks The sound is faded to the master volume audio level.
     * A pre-fade offset is applied, when configured
     * An actual fade operation is only started when
     * - the fading duration is non-zero and
     * - no previous fade operation is ongoing
     * otherwise
     * - the promise is immediately resolved.
     */
    fadeIn(): Promise<void>;

    // --- volume ---

    /** Sets the master audio volume
     * @remarks The value is applied immediately, without any fading, with the possible muted state observed
     * @param {number} volume - A value between 0 (zero) and 1 (representing full scale)
     */
    setMasterAudioVolume(volume: number): void;

    /** Gets or sets the muted state
     */
    muted: boolean;

    /** Gets the fading state
     */
    readonly fading: boolean;

    // --- transport ---

    /** Emits a changed fading state.
     * @param {boolean} fading - whether a fading operation is currently ongoing
     */
    onFadingChanged: SubEvent<boolean>;

    /** Emits a changed paused state.
     * @param {boolean} paused - whether the playback is currently paused (or otherwise not playing)
     */
    onPausedChanged: SubEvent<boolean>;

    /** Gets the paused state
     */
    readonly paused: boolean;

    /** Initiates a fade-out operation, then sets the state to paused */
    pause(): void;

    /** Immediately pauses playback. Stops a possible ongoing fading operation. */
    stop(): void;

    // --- looping ---

    // --- media loading ---

    /** Gets the duration of the current track, in [seconds]
     * @remarks This is only available after successful load of the media metadata.
     * Could be NaN or infinity, depending on the source
     */
    readonly durationSeconds: number | null;

    /** Whether the media metadata has loaded. Duration is available now.
     */
    readonly hasLoadedMetadata: boolean;

    /** Emits a changed duration.
     * @param {number} duration - could be NaN or infinity, depending on the source
     */
    onDurationChanged: SubEvent<number>;

    /** Emits a changed current time position.
     * @param {number} currentTime - could be NaN or infinity, depending on the source
     */
    onCurrentTimeChanged: SubEvent<number>;

    /** Flags, whether deferred loading (until a user play click event is handled)
     * is required to further load the track media file data. The flag may be set once after the metadata was successfully loaded.
     * @remarks When true, handling of a subsequent play action must first invoke a user-triggered load operation.
     * @remarks This specific handling is currently required on (some?) iOS devices,
     * because they only load data upon explicit user interaction.
     */
    isClickToLoadRequired: boolean;
}
