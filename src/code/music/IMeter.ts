/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import type { ITimeSignature } from './ITimeSignature';

/** @interface Defines a musical meter
 */
export interface IMeter {
    /** The time signature */
    TimeSignature: ITimeSignature | null;

    /** The tempo in beats per minute */
    BeatsPerMinute: number | null;

    /** The origin time for the beat (first downbeat of the first measure) */
    OriginTime: number | null;
}
