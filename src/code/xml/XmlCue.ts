import { Cue } from '@/store/compilation-types';

/** @class Implements an XML-Representation of a Cue
 * @remarks This is intended to define the export structure for xml2js exp
 */
export class XmlCue {
    /** @constructor
     * @param {Cue} cue - The Typescript cue object to represent
     */
    constructor(cue: Cue) {
        this.Id = cue.Id;
        this.Description = cue.Description;
        this.Shortcut = cue.Shortcut;
        this.Time = cue.Time;
    }

    Id: string;
    Description: string;
    Shortcut: string;
    Time: number | null;
}
