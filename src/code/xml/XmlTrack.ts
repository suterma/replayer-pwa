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

import type { ITrack } from '@/store/ITrack';
import { XmlCues } from './XmlCues';
import { XmlMeter } from './XmlMeter';

/** @class Implements an XML-Representation of a Track
 * @remarks This is intended to define the export structure for an export with the xml2js module
 */
export class XmlTrack {
    /** @constructor
     * @param {Track} track - The Typescript track object to represent
     */
    constructor(track: ITrack) {
        this.Id = track.Id;
        this.Artist = track.Artist;
        this.PreRoll = track.PreRoll;
        this.PlayheadPosition = track.PlayheadPosition;
        this.PlaybackRate = track.PlaybackRate;
        this.Name = track.Name;
        this.Album = track.Album;
        this.Url = track.Url;
        this.Meter = track.Meter;
        this.UseMeasureNumbers = track.UseMeasureNumbers;
        this.Volume = track.Volume;
        this.Cues = new XmlCues(track.Cues);
    }

    Id: string;
    Artist: string;
    PreRoll: number | null;
    PlayheadPosition: number | null;
    PlaybackRate: number;
    Name: string;
    Album: string;
    Url: string;
    Meter: XmlMeter | null;
    UseMeasureNumbers: boolean | null;
    Volume: number;
    Cues: XmlCues;
}
