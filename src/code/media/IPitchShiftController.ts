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
