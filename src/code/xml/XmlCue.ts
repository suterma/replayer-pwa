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

import { Cue } from '@/store/Cue';

/** @class Implements an XML-Representation of a Cue
 * @remarks This class is intended to define the export structure for an export with the xml2js module
 */
export class XmlCue {
    /** @constructor
     * @param {Cue} cue - The Typescript cue object to represent
     */
    constructor(cue: Cue) {
        this.Id = cue.Id;
        this.Description = cue.Description;
        this.Remarks = cue.Remarks;
        this.Shortcut = cue.Shortcut;
        this.Time = cue.Time;
        this.OmitPreRoll = cue.OmitPreRoll;
        this.OmitFadeIn = cue.OmitFadeIn;
    }

    Id: string;
    Description: string | null;
    Remarks: string | null;
    Shortcut: string | null;
    Time: number | null;
    OmitPreRoll: boolean | null;
    OmitFadeIn: boolean | null;
}
