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

/** A position using a musical meter (a time representation using measures and beats).
 *  */
export class MetricalPosition {
    /** The measure number (one-based)
     * @remarks The measure number is optional (e.g. set to null when the playhead is before the origin).
     */
    Measure: number | null;

    /** The beat number within the current measure (one-based)
     * @remarks The beat number is optional, when only a measure should be represented.
     */
    Beat: number | null;

    /** Creates a new metrical position
     * @param {number} measure - The measure number
     * @param {number | null} beat - The beat number within the current measure
     */
    constructor(measure: number | null, beat: number | null) {
        this.Measure = measure;
        this.Beat = beat;
    }
}
