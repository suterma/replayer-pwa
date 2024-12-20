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

import { v4 as uuidv4 } from 'uuid';
import type { ITrack } from './ITrack';
import type { ICompilation } from './ICompilation';
import { Cue } from './Cue';
import {
    DefaultPitchShift,
    DefaultPlaybackRate,
    DefaultTrackVolume,
    Track,
} from './Track';

/** Implements a Replayer Compilation, consisting of a set of tracks with their cues.  */
export class Compilation implements ICompilation {
    MediaPath = '';
    Title = '';
    Artist = '';
    Album = '';
    Url = '';
    Id = '';
    Tracks: Array<ITrack> = new Array<ITrack>();
    SelectedTags: Set<string> = new Set<string>([]);

    /** Creates a new compilation
     * @remarks Playback mode is persisted in the application state for user convenience.
     */
    constructor(
        mediaPath: string,
        title: string,
        artist: string,
        album: string,
        url: string,
        id: string,
        tracks: Array<ITrack>,
        selectedTags: Set<string>,
    ) {
        this.MediaPath = mediaPath;
        this.Title = title;
        this.Artist = artist;
        this.Album = album;
        this.Url = url;
        this.Id = id;
        this.Tracks = tracks;
        this.SelectedTags = selectedTags;
    }

    /** Parses the JSON and returns new instance of this class.
     * @remarks Instead of creating an unprototyped object with JSON.parse, this creates a new object of this type
     * @param jsonCompilation - a JSON representation of a Compilation
     * @devdoc See https://stackoverflow.com/a/5874189/79485
     */
    static fromJson(jsonCompilation: string): Compilation {
        const obj = JSON.parse(jsonCompilation) as Compilation;
        const compilation = new Compilation(
            obj.MediaPath,
            obj.Title,
            obj.Artist,
            obj.Album,
            obj.Url,
            obj.Id,
            obj.Tracks.map((track) => {
                return new Track(
                    track.Name,
                    track.Album,
                    track.Artist,
                    track.PreRoll,
                    track.PlayheadPosition,
                    track.PlaybackRate ?? DefaultPlaybackRate,
                    track.PitchShift ?? DefaultPitchShift,
                    track.Meter,
                    track.UseMeasureNumbers,
                    track.Url,
                    track.Id,
                    track.Cues.map((cue) => {
                        return new Cue(
                            cue.Description,
                            cue.Remarks,
                            cue.Shortcut,
                            cue.Time,
                            cue.Duration,
                            cue.OmitPreRoll,
                            cue.OmitFadeIn,
                            cue.Id,
                        );
                    }),
                    new Set<string>(track.Tags),
                    track.Duration,
                    track.Volume ?? DefaultTrackVolume,
                );
            }),
            new Set<string>(obj.SelectedTags),
        );
        return compilation;
    }

    /** Returns a new, empty compilation
     */
    static empty(): Compilation {
        return new Compilation(
            '',
            '',
            '',
            '',
            '',
            uuidv4(),
            new Array<ITrack>(),
            new Set<string>([]),
        );
    }

    /** Whether any of title, album or artist is set to a non-empty value */
    public hasLabels(): boolean {
        return !!this.Title || !!this.Album || !!this.Artist;
    }
}
