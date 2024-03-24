/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import { Cue } from '@/store/Cue';

/** @class Implements an XML-Representation of a Cue
 * @remarks This is intended to define the export structure for an export with the xml2js module
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
    Shortcut: string | null;
    Time: number | null;
}
