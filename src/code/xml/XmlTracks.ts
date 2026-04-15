import type { Track } from '@/store/Track';
import type { ITrack } from '@/store/ITrack';
import { XmlTrack } from './XmlTrack';

/** @class Implements an XML-Representation of a Tracks set
 * @remarks This class is intended to define the export structure for an export with the xml2js module.
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
