import { SubEvent } from 'sub-events';

/** @interface Defines a media handler for use with media tracks. */
export interface IMediaHandler {
    // --- configuration and update ---

    /** A unique identifier for this handler.
     * @remarks To work correctly, this identifier must be unique among all currently existing handlers.
     *  Best, to make it universally unique by using a UUID.
     * @devdoc This identifier allows to internally recognise this handler's element in the DOM. It's used as the HTML Element Id.
     */
    readonly id: string;

    /** Updates the current fader settings.
     * @remarks The settings will be used for the next fade.
     * However, when the new duration is zero (no fade),
     * the cancel operation is immediately called, resetting the volume to the initial value for this case.
     */
    updateSettings(): void;

    // --- fading ---

    /** Returns a linear fade-out promise.
     * @remarks The sound is faded to the minimum audio level.
     * An actual fade operation is only started when
     * - the fading duration is non-zero and
     * - no previous fade operation is ongoing
     * otherwise
     * - a fade with duration zero is started and the promise is immediately resolved.
     */
    fadeOut(): Promise<void>;

    /** Returns a linear fade-in promise.
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

    // --- transport ---

    readonly paused: boolean;

    /** Initiates fade-out operation, then sets the state to paused */
    //pause(): void;

    /** Immediately pauses playback. Stops a possible ongoing fading operation. */
    stop(): void;

    // --- media loading ---

    /** Gets the duration of the current track, in [seconds]
     * @remarks This is only available after successful load of the media metadata.
     * Could be NaN or infinity, depending on the source
     */
    readonly durationSeconds: number | null;

    /** Emits a changed duration.
     * @param {number} duration - could be NaN or infinity, depending on the source
     */
    onDurationChanged: SubEvent<number>;
}
