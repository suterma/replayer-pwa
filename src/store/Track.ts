import type { IMeter } from '@/code/music/IMeter';
import type { ITrack } from './ITrack';
import type { ICue } from './ICue';

/** The default track volume */
export const DefaultTrackVolume = 0.5;

/** Implements a Replayer track
 *  @inheritdoc */

export class Track implements ITrack {
    Name = '';
    Album = '';
    Artist = '';
    PreRoll: number | null = null;
    Meter: IMeter | null = null;
    UseMeasureNumbers: boolean | null = null;
    Url = '';
    Id = '';
    Cues: Array<ICue> = new Array<ICue>();

    /**   @inheritdoc */
    Duration: number | null = null;
    Volume: number;

    /** Creates a new track
     * @param name {string} - The name for the track.
     * @param album {string} - The album name, if any.
     * @param artist {string} - The artist name, if any.
     * @param url {string} - The online URL (starting with http(s)) or the local file name (possibly including a path) for the media file. If it is relative, it may get made absolute using the compilation's media path.
     * @param duration {number | null} - Duration of the media associated with the track. This is not persisted, but set to a specific value once after a matching track has been loaded.
     * @param volume {volume} - Track volume. This is persisted in the application state for user convenience.
     */
    constructor(
        name: string,
        album: string,
        artist: string,
        preRoll: number | null,
        meter: IMeter | null,
        useMeasureNumbers: boolean | null,
        url: string,
        id: string,
        cues: Array<ICue>,
        duration: number | null,
        volume: number,
    ) {
        this.Name = name;
        this.Album = album;
        this.Artist = artist;
        this.PreRoll = preRoll;
        this.Meter = meter;
        this.UseMeasureNumbers = useMeasureNumbers;
        this.Url = url;
        this.Id = id;
        this.Cues = cues;
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
            obj.Meter,
            obj.UseMeasureNumbers,
            obj.Url,
            obj.Id,
            obj.Cues,
            null,
            obj.Volume ?? DefaultTrackVolume,
        );
        console.debug('Track::fromJson:'), track;
        return track;
    }
}