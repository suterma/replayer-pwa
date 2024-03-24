/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

/** @interface Defines a time signature
 */
export interface ITimeSignature {
    /** The number of beats per measure */
    Numerator: number | null;
    /** The note value of the beats */
    Denominator: number | null;
}
