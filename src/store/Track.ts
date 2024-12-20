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

import type { IMeter } from '@/code/music/IMeter';
import type { ITrack } from './ITrack';
import type { ICue } from './ICue';

/** The default track volume */
export const DefaultTrackVolume = 0.5;

/** The default track playback rate */
export const DefaultPlaybackRate = 1;

/** The default pitch shift in [cents]
 * @remarks default is zero, meaning no shift.
 */
export const DefaultPitchShift = 0;

/** Implements a Replayer track */
export class Track implements ITrack {
    Name = '';
    Album = '';
    Artist = '';
    PreRoll: number | null = null;
    PlayheadPosition: number | null = null;

    /**   @inheritdoc */
    PlaybackRate: number = DefaultPlaybackRate;
    /**   @inheritdoc */
    PitchShift: number = DefaultPitchShift;
    Meter: IMeter | null = null;
    UseMeasureNumbers: boolean | null = null;
    Url = '';
    Id = '';
    Cues: Array<ICue> = new Array<ICue>();
    Tags: Set<string> = new Set<string>([]);

    /**   @inheritdoc */
    Duration: number | null = null;
    Volume: number = DefaultTrackVolume;

    /** Creates a new track
     * @param name {string} - The name for the track.
     * @param album {string} - The album name, if any.
     * @param artist {string} - The artist name, if any.
     * @param url {string} - The online URL (starting with http(s)) or the local file name (possibly including a path) for the media file. If it is relative, it may get made absolute using the compilation's media path.
     * @param preRoll {number | null} - The track's custom pre-roll duration, in [seconds]
     * @param initialPlayheadPosition {number | null} - The track's initial playhead position, in [seconds]. The value will be applied once after a media resource with a player has been mounted.
     * @param playbackRate {number} - The track's playback rate. If not finite, a default value is used.
     * @param pitchShift {number} - The track's pitch shift in [cents]. If not finite, a default value is used.
     * @param duration {number | null} - Duration of the media associated with the track. This is not persisted, but set to a specific value once after a matching track has been loaded.
     * @param volume {volume} - Track volume.
     */
    constructor(
        name: string,
        album: string,
        artist: string,
        preRoll: number | null,
        initialPlayheadPosition: number | null,
        playbackRate: number,
        pitchShift: number,
        meter: IMeter | null,
        useMeasureNumbers: boolean | null,
        url: string,
        id: string,
        cues: Array<ICue>,
        tags: Set<string>,
        duration: number | null,
        volume: number,
    ) {
        this.Name = name;
        this.Album = album;
        this.Artist = artist;
        this.PreRoll = preRoll;
        this.PlayheadPosition = initialPlayheadPosition;
        this.PlaybackRate = Number.isFinite(playbackRate)
            ? playbackRate
            : DefaultPlaybackRate;
        this.PitchShift = Number.isFinite(pitchShift)
            ? pitchShift
            : DefaultPitchShift;
        this.Meter = meter;
        this.UseMeasureNumbers = useMeasureNumbers;
        this.Url = url;
        this.Id = id;
        this.Cues = cues;
        this.Tags = tags;
        this.Duration = duration;
        this.Volume = volume;
    }

    /** Parses the JSON and returns new instance of this class.
     * @remarks Instead of creating an unprototyped object with JSON.parse, this creates a new object of this type
     * @param jsonTrack - a JSON representation of a Track
     * @devdoc See https://stackoverflow.com/a/5874189/79485
     */
    public static fromJson(jsonTrack: string): Track {
        const obj = JSON.parse(jsonTrack) as Track;
        const track = new Track(
            obj.Name,
            obj.Album,
            obj.Artist,
            obj.PreRoll,
            obj.PlayheadPosition,
            obj.PlaybackRate,
            obj.PitchShift,
            obj.Meter,
            obj.UseMeasureNumbers,
            obj.Url,
            obj.Id,
            obj.Cues,
            new Set<string>(obj.Tags),
            null /* duration not persisted */,
            obj.Volume ?? DefaultTrackVolume,
        );
        return track;
    }
}
