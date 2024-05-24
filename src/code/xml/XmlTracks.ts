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

import type { Track } from '@/store/Track';
import type { ITrack } from '@/store/ITrack';
import { XmlTrack } from './XmlTrack';

/** @class Implements an XML-Representation of a Tracks set
 * @remarks Omits media positions in the output
 * @remarks This is intended to define the export structure for an export with the xml2js module
 */
export class XmlTracks {
    /** @constructor
     * @param {ITrack[] | undefined} tracks - The tracks to covert to their XML representation.
     */
    constructor(tracks: ITrack[] | undefined) {
        if (tracks) {
            tracks.forEach((track: Track) => {
                this.Track.push(new XmlTrack(track));
            });
        }
    }
    /** The set of tracks; will be rendered as an XML sequence
     * @remarks This is named singular because this is the name it should have in the XML sequence
     */
    Track: XmlTrack[] = new Array<XmlTrack>();
}
