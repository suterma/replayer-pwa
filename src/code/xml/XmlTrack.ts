import { ITrack } from '@/store/compilation-types';
import { XmlCues } from './XmlCues';

/** @class Implements an XML-Representation of a Track
 * @remarks This is intended to define the export structure for a compilation, for export with the xml2js module */
export class XmlTrack {
    /** @constructor
     * @param {Track} track - The Typescript track object to represent
     */
    constructor(track: ITrack) {
        this.Id = track.Id;
        this.Artist = track.Artist;
        this.Name = track.Name;
        this.Album = track.Album;
        this.Measure = track.Measure;
        this.Url = track.Url;
        this.Volume = track.Volume;
        this.Cues = new XmlCues(track.Cues);
    }

    Id: string;
    Artist: string;
    Name: string;
    Album: string;
    Measure: number | null;
    Url: string;
    Volume: number;
    Cues: XmlCues;
}
