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

import { XmlTimeSignature } from './XmlTimeSignature';

/** @class Implements an XML-Representation of a musical meter
 * @remarks This class is intended to define the export structure for an export with the xml2js module
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
