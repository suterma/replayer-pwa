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

import type { ICue } from '@/store/ICue';
import { XmlCue } from './XmlCue';

/** @class Implements an XML-Representation of a Cues set
 * @remarks This class is intended to define the export structure for a compilation, for export with the xml2js module
 *  */
export class XmlCues {
    /** @constructor
     * @param {ICue[]} cues - The set of cues to represent
     */
    constructor(cues: ICue[] | undefined) {
        if (cues) {
            for (const cue of cues) {
                this.Cue.push(new XmlCue(cue));
            }
        }
    }
    /** The set of cues; will be rendered as an XML sequence
     * @remarks This is named singular because this is the name it should have in the XML sequence
     */
    Cue: XmlCue[] = new Array<XmlCue>();
}
