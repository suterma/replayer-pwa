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
