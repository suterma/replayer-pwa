import { SubEvent } from 'sub-events';
import { IAudioFader } from './IAudioFader';

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

    /** Destroys the instance by releasing it's resources.
     */
    destroy(): void;

    // --- fading ---

    /** Gets the audio fading handler
     */
    readonly fader: IAudioFader;

    // --- transport ---

    /** Emits a changed paused state.
     * @param {boolean} paused - whether the playback is currently paused (or otherwise not playing)
     */
    readonly onPausedChanged: SubEvent<boolean>;

    /** Emits a changed seeking state.
     * @param {boolean} seeking - whether the media is currently seeked (while playing or not)
     */
    readonly onSeekingChanged: SubEvent<boolean>;

    /** Emits an ocurred seek operation.
     * @param {number} targetTime - the target time of the seek operation
     */
    readonly onSeeked: SubEvent<number>;

    /** Gets the paused state
     */
    readonly paused: boolean;

    /** Gets the media duration. Might be a non-finite number, if data is not available.
     */
    get duration(): number;

    /** Emits a changed current time position, in [seconds].
     * @remarks The change can stem fron ongoing playback and/or a seek or loop operation.
     * @param {number} currentTime - could be NaN or infinity, depending on the source
     */
    readonly onCurrentTimeChanged: SubEvent<number>;

    /** Gets the current time position in [seconds].
     * @remarks This is not necessarily the exact same value as was last emitted via {onCurrentTimeChanged}.
     * @returns {number} currentTime - could be NaN or infinity, depending on the source
     */
    readonly currentTime: number;

    /** Seeks forward or backward, for the given amount of seconds, if the media is loaded and the position is valid.
     * @param {number} seconds - amount of time, in [seconds], to seek
     */
    seek(seconds: number): void;

    /** Seeks to the given time position, if the media is loaded and the position is valid.
     * @remarks Immediately also advertises the new temporal position
     * @param {number} seconds - the temporal position, in [seconds], to seek to
     */
    seekTo(seconds: number): void;

    /** Initiates a fade-out operation, then sets the state to paused */
    pause(): void;

    /** Immediately pauses playback. Stops a possible ongoing fading operation. */
    stop(): void;

    /** Occurs, when the end of the track has been reached and playback has ended.
     * @remarks This is not triggered when the track or a range is looping.
     * @remarks Allows to select the next track in "play all" and "shuffle" mode.
     */
    onEnded: SubEvent<void>;

    /** Starts playback from the given temporal position
     * @remarks This first seeks to the position, then starts playing (with a possible fade-in)
     */
    playFrom(position: number): void;

    /** Starts playback from the current temporal position
     * @remarks Applies a possible fade-in
     */
    play(): void;

    /** Toggles the playback state */
    togglePlayback(): void;

    /** Pauses playback (with a possible fade-out), then seeks to the given position */
    pauseAndSeekTo(position: number): void;

    // --- media loading ---

    /** Gets or sets the media source URL
     */
    mediaSourceUrl: string;

    /** Gets the duration of the current track, in [seconds]
     * @remarks This is only available after successful load of the media metadata.
     * Could be NaN or infinity, depending on the source
     */
    readonly durationSeconds: number | null;

    /** Emitted when the media data has loaded enough to start playback
     * @devdoc This is emitted separately from the data loading state and events, since the underlying
     * implementation might handle it separately.
     */
    onCanPlay: SubEvent<void>;

    /** Whether the media metadata has loaded. Duration is available now.
     */
    readonly hasLoadedMetadata: boolean;

    /** Emits a changed duration.
     * @param {number} duration - could be NaN or infinity, depending on the source
     */
    onDurationChanged: SubEvent<number>;

    /** Flags, whether deferred loading (until a user play click event is handled)
     * is required to further load the track media file data. The flag may be set once after the metadata was successfully loaded.
     * @remarks When true, handling of a subsequent play action must first invoke a user-triggered load operation.
     * @remarks This specific handling is currently required on (some?) iOS devices,
     * because they only load data upon explicit user interaction.
     */
    isClickToLoadRequired: boolean;

    // --- looping ---

    /** Gets or sets whether to loop this whole track.
     * @remarks This does not apply to compilation looping (looping over a set of tracks).
     */
    loop: boolean;
}
