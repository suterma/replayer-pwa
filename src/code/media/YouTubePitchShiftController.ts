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

import { DefaultPitchShift } from '@/store/Track';
import { SubEvent } from 'sub-events';
import type { IPitchShiftController } from './IPitchShiftController';
import type { ShallowRef } from 'vue';

/** @class Implements an intert pitch shift controller for a {YouTubeElement}.
 * @remarks YouTube does not support pitch shift
 */
export default class YouTubePitchShiftController
    implements IPitchShiftController
{
    /** @constructor
     */
    constructor() {}

    public destroy(): void {
        this.onPitchShiftChanged.cancelAll();
    }

    updateShift(shift: number): void {
        this.onPitchShiftChanged.emit(shift);
    }

    onPitchShiftChanged: SubEvent<number> = new SubEvent();

    /** Gets the pitch shift.
     */
    get pitchShift(): number {
        return DefaultPitchShift;
    }
    /** Sets the pitch shift.
     */
    set pitchShift(_shift: number) {}
}
