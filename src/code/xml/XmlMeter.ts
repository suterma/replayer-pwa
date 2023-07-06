import { XmlTimeSignature } from './XmlTimeSignature';

/** @class Implements an XML-Representation of a musical meter
 * @remarks This is intended to define the export structure for an export with the xml2js module
 */
export class XmlMeter {
    /** @constructor
     * @param {XmlMeter} meter - The Typescript cue object to represent
     */
    constructor(meter: XmlMeter) {
        this.BeatsPerMinute = meter.BeatsPerMinute;
        this.OriginTime = meter.OriginTime;
        this.TimeSignature = meter.TimeSignature;
    }

    BeatsPerMinute: number | null;
    OriginTime: number | null;
    TimeSignature: XmlTimeSignature | null;
}
