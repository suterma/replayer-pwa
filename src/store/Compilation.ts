/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import { v4 as uuidv4 } from 'uuid';
import type { ITrack } from './ITrack';
import { CompilationType } from './CompilationType';
import type { ICompilation } from './ICompilation';
import { Cue } from './Cue';
import { DefaultPlaybackRate, DefaultTrackVolume, Track } from './Track';

/** Implements a Replayer Compilation, consisting of a set of tracks with their cues.
 *  @inheritdoc */

export class Compilation implements ICompilation {
    Type: CompilationType = CompilationType.XML;
    MediaPath = '';
    Title = '';
    Artist = '';
    Album = '';
    Url = '';
    Id = '';
    Tracks: Array<ITrack> = new Array<ITrack>();

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
    ) {
        this.MediaPath = mediaPath;
        this.Title = title;
        this.Artist = artist;
        this.Album = album;
        this.Url = url;
        this.Id = id;
        this.Tracks = tracks;
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
                    track.Meter,
                    track.UseMeasureNumbers,
                    track.Url,
                    track.Id,
                    track.Cues.map((cue) => {
                        return new Cue(
                            cue.Description,
                            cue.Shortcut,
                            cue.Time,
                            cue.Duration,
                            cue.Id,
                        );
                    }),
                    track.Duration,
                    track.Volume ?? DefaultTrackVolume,
                );
            }),
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
        );
    }

    /** Whether any of title, album or artist is set to a non-empty value */
    public hasLabels(): boolean {
        return !!this.Title || !!this.Album || !!this.Artist;
    }
}
