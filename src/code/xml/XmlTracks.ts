/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import type { Track } from '@/store/Track';
import type { ITrack } from '@/store/ITrack';
import { XmlTrack } from './XmlTrack';

/** @class Implements an XML-Representation of a Tracks set
 * @remarks This is intended to define the export structure for an export with the xml2js module
 */
export class XmlTracks {
    /** @constructor
     * @param {string} fileName - The name of the original media file (from the disk or from within a REZ/ZIP-file)
     * @param {string} objectUrl - The object URL representing the playable file content
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
