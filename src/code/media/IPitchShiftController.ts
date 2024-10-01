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

import type { SubEventImmediate } from './SubEventImmediate';

/** @interface Defines a pitch shift controller.
 */
export interface IPitchShiftController {
    /** Gets or sets the media pitch shift, in [cents].
     */
    pitchShift: number;

    /** Emits an updated pitch shift.
     * @param {number} shift - the updated shift in [cents].
     */
    readonly onPitchShiftChanged: SubEventImmediate<number>;
}
