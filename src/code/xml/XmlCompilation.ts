import { Compilation } from '@/store/compilation-types';
import { XmlTracks } from './XmlTracks';

/** @class Implements an XML-Representation of a Compilation
 * @remarks This is intended to define the export structure for xml2js exp
 */
export class XmlCompilation {
    /** @constructor
     * @param {Compilation} compilation - The Typescript track object to represent
     */
    constructor(compilation: Compilation | undefined) {
        if (compilation) {
            this.Id = compilation.Id;
            this.MediaPath = compilation.MediaPath;
            this.Title = compilation.Title;
            this.Tracks = new XmlTracks(compilation.Tracks);
        }
    }

    Id = '';
    MediaPath = '';
    Title = '';
    Tracks: XmlTracks = new XmlTracks(undefined);
}
