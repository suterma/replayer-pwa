/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

/** @class Implements an XML-Representation of a time signature
 * @remarks This is intended to define the export structure for an export with the xml2js module
 */
export class XmlTimeSignature {
    /** @constructor
     * @param {XmlTimeSignature} timeSignature - The Typescript cue object to represent
     */
    constructor(timeSignature: XmlTimeSignature) {
        this.Numerator = timeSignature.Numerator;
        this.Denominator = timeSignature.Denominator;
    }

    Numerator: number | null;
    Denominator: number | null;
}
