/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

/** @class Implements a timestamped reading of a value
 * @remarks This is intended to have accurate aggregations of multiple, consecutive retrieved values
 */
export class Reading<T> {
    /** @constructor
     * @param {number} timestamp - The exact time at the moment of the reading
     * @param {number} value - The read value
     */
    constructor(timestamp: number, value: T) {
        this.Timestamp = timestamp;
        this.Value = value;
    }

    Timestamp: number;
    Value: T;
}
