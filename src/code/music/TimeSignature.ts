import { ITimeSignature } from './ITimeSignature';

/** Implements a time signature
 *  @inheritdoc */

export class TimeSignature implements ITimeSignature {
    /** The number of beats per measure */
    Numerator: number | null;
    /** The note value of the beats */
    Denominator: number | null;

    /** Creates a new time signature
     * @param {number | null} numerator - The number of beats per measure
     * @param {number | null} denominator - The note value of the beats
     */
    constructor(numerator: number | null, denominator: number | null) {
        this.Numerator = numerator;
        this.Denominator = denominator;
    }
}
