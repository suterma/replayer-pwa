/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import type { ITimeSignature } from './ITimeSignature';

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
