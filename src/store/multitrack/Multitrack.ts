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

/** @class Implements a timestamped reading of a value
 * @remarks This is intended to have accurate aggregations of multiple, consecutive retrieved values
 */
export class Multitrack {
    /** The maximum track timing deviation allowed, in [seconds],
     * before an auto-sync operation executed
     * @remarks The value is chosen to keep sync errors mostly inaudible
     * @ See https://sengpielaudio.com/calculator-soundpath.htm for
     * details.
     * A value of 15 milliseconds represents a distance of 5 meters at room temperature.
     * This value might be considered typical for a small stage or rehearsal romm.
     */
    static MaxTrackTimeDeviation = 0.015;
}
