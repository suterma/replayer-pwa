/** @class Implements an XML-Representation of a time signature
 * @remarks This is intended to define the export structure for a compilation, for export with the xml2js module */
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
