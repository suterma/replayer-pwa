/** @interface Defines a time signature
 */
export interface ITimeSignature {
    /** The number of beats per measure */
    Numerator: number | null;
    /** The note value of the beats */
    Denominator: number | null;
}
