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

import { type ICompilation } from '@/store/ICompilation';
import { PlaybackMode } from '@/store/PlaybackMode';
import { XmlTracks } from './XmlTracks';

/** @class Implements an XML-Representation of a Compilation
 * @remarks This is intended to define the export structure for an export with the xml2js module
 */
export class XmlCompilation {
    /** @constructor
     * @remarks Omits media positions in the output
     * @param {Compilation} compilation - The Typescript track object to represent
     */
    constructor(compilation: ICompilation | undefined) {
        if (compilation) {
            this.Id = compilation.Id;
            this.MediaPath = compilation.MediaPath;
            this.Title = compilation.Title;
            this.Artist = compilation.Artist;
            this.Album = compilation.Album;
            this.Tracks = new XmlTracks(compilation.Tracks);
        }
    }
    // for the $: any, because this is per the docs of the XML library
    // eslint-disable-next-line
    $: any = {
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
    };
    Id = '';
    MediaPath = '';
    Title = '';
    Artist = '';
    Album = '';
    Tracks: XmlTracks = new XmlTracks(undefined);
    PlaybackMode: PlaybackMode = PlaybackMode.PlayTrack;
}
