/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

/** @interface Defines features for looping ranges in a media.
 * @remarks This defines looping of a temporal range, for use during playback.
 * Intentionally, no volume control is defined with regards to looping.
 * Implementors are free to apply e.g. fading at the loop boundaries.
 */
export interface IMediaLooper {
    /** Gets the start time of the loop range. */
    get loopStart(): number | null;

    /** Gets the end time of the loop range. */
    get loopEnd(): number | null;

    /** Gets the loop mode.
     */
    get LoopMode(): LoopMode;

    /** Whether to use fading on loop boundaries
     * @remarks Off by default to provide continuous playback when looping back to the start.
     */
    useFadingOnLoopBoundaries: boolean;

    /** Sets a ranged loop */
    SetLoop(start: number, end: number, mode: LoopMode): void;

    /** Removes a ranged loop */
    RemoveLoop(): void;
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
