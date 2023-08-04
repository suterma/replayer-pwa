/** @interface Defines features for media looping.
 * @remarks This defines looping of a range or a full track, for use during playback.
 * Intentionally, no volume control is defined with regards to looping.
 * Implementors are free to apply e.g. fading at the loop boundaries.
 */
export interface IMediaLooper {
    /** Gets the start time of the loop range. */
    get loopStart(): number | null;

    /** Sets the start time of the loop range. */
    set loopStart(value: number | null);

    /** Gets the end time of the loop range. */
    get loopEnd(): number | null;

    /** Sets the end time of the loop range. */
    set loopEnd(value: number | null);

    /** Gets the loop mode.
     */
    get LoopMode(): LoopMode;

    /** Sets the loop mode. */
    set LoopMode(value: LoopMode);

    /** Gets enabled state.
     * @remarks Looping is only 'enabled' when set and when both boundaries are set to a finite number.
     */
    get enabled(): boolean;

    /** Sets the enabled state. */
    set enabled(value: boolean);

    /** Sets a track loop */
    SetTrackLoop(mode: LoopMode): void;
}

/** A loop mode for a range
 * */
export enum LoopMode {
    /** Loop once
     * @remarks The position is set back to the start, when the end has been reached
     */
    Once = 'Once',
    /** Loop recurring, for an indefinite duration */
    Recurring = 'Recurring',
}
