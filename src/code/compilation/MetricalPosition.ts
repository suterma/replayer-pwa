/** A position using a musical meter (a time representation using measures and beats).
 *  */
export class MetricalPosition {
    /** The measure number (index-1 based) */
    Measure: number;

    /** The beat number within the current measure (index-1 based)
     * @remarks The beat number is optional, when only a measure should be represented.
     */
    Beat: number | null;

    /** Creates a new metrical position
     * @param {number} measure - The measure number
     * @param {number | null} beat - The beat number within the current measure
     */
    constructor(measure: number, beat: number | null) {
        this.Measure = measure;
        this.Beat = beat;
    }
}
