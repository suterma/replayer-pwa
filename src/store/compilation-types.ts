import { v4 as uuidv4 } from 'uuid';

export enum CompilationType {
    /** XML Compilation type, currently the only one supported */
    XML = 'XML',
}

/** @interface Defines a Replayer Compilation, consisting of a set of tracks with their cuepoints.
 * @remarks This definition corresponds to the defitions in https://github.com/suterma/Replayer/blob/master/SOURCE/Replayer.Model/ICompilation.cs for the classic WinForms Replayer
 * @remarks The implemented type is advertised as the Type. Using this pattern saves the code from implementing a full blown plugin architecture.
 */
export interface ICompilation {
    /** Gets the implemented type of this compilation. */
    Type: CompilationType;

    /** The media path. This is where the media files are retrieved from.
     * @remarks Applies to all included media files, but may be overridden by specific paths to individual files
     */
    MediaPath: string;

    /** The title for this Compilation. */
    Title: string;

    /** the URL, where this Compilation is stored. This is used for storage and retrieval of the compilation. */
    Url: string;

    /** A unique identifier for this compilation.
     * @remarks To work correctly, this identifier must be unique among all currenlty loaded compilations. Best, to make it universally unique by using a UUID.
     * @devdoc This identifier allows to recognise this item over multiple edits
     */
    Id: string;

    /** The set of tracks */
    Tracks: Array<ITrack>;
}
/** @interface Defines a Replayer track */
export interface ITrack {
    /** The cues */
    Cues: Array<ICue>;
    /** The artist */
    Artist: string;

    /** The name of the track */
    Name: string;

    /** The album name where this track was taken from.
     * @remarks This is a more descriptive information and not intended to uniquely identify an album.
     */
    Album: string;

    /** The measure in beats per minute (Zero for no value). */
    Measure: number;

    /** The URL for the media file.
     * @remarks Currently, only local file paths are supported.
     * @devdoc If it is relative, it may get made absolute using the compilation's media path.
     */
    Url: string;

    /** A unique identifier for this track.
     * @remarks To work correctly, this identifier must be unique among all currenlty loaded compilations. Best, to make it universally unique by using a UUID.
     * @devdoc This identifier allows to recognise this item over multiple edits
     */
    Id: string;
}

/** @interface Defines a Replayer cue */
export interface ICue {
    Description: string;
    /** A unique identifier for this cue.
     * @remarks To work correctly, this identifier must be unique among all currenlty loaded compilations. Best, to make it universally unique by using a UUID.
     * @devdoc This identifier allows to recognise this item over multiple edits
     */
    Id: string;
    Shortcut: string;
    Time: number | null;
    /** The calculated duration of the cue
     * @remarks This is only defined if there is a subsequent cue, or if it is the last queue in a track, the track lenght is known.
     * @devdoc This must get recalculated if the set of cues changes, or the track is loaded/unloaded. It must never get persisted.
     */
    Duration: number | null;
}

/** Implements a Replayer Compilation, consisting of a set of tracks with their cues.
 *  @inheritdoc */
export class Compilation implements ICompilation {
    Type: CompilationType = CompilationType.XML;
    MediaPath = '';
    Title = '';
    Url = '';
    Id = '';
    Tracks: Array<ITrack> = new Array<ITrack>();

    /** Creates a new compilation
     */
    constructor(
        mediaPath: string,
        title: string,
        url: string,
        id: string,
        tracks: Array<ITrack>,
    ) {
        this.MediaPath = mediaPath;
        this.Title = title;
        this.Url = url;
        this.Id = id;
        this.Tracks = tracks;
    }

    /** Parses the JSON and returns new instance of this class.
     * @remparks Instead of creating an unprototyped object with JSON.parse, this creates a new object of this type
     * @param jsonCompilation - a JSON representation of a Compilation
     * @devdoc See https://stackoverflow.com/a/5874189/79485
     */
    static fromJson(jsonCompilation: string): Compilation {
        const obj = JSON.parse(jsonCompilation) as Compilation;
        const compilation = new Compilation(
            obj.MediaPath,
            obj.Title,
            obj.Url,
            obj.Id,
            obj.Tracks.map((track) => {
                return new Track(
                    track.Name,
                    track.Album,
                    track.Artist,
                    track.Measure,
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
            'New Compilation',
            '',
            uuidv4(),
            new Array<ITrack>(),
        );
    }
}

/** Implements a Replayer track
 *  @inheritdoc */
export class Track implements ITrack {
    Name = '';
    Album = '';
    Artist = '';
    Measure = 0;
    Url = '';
    Id = '';
    Cues: Array<ICue> = new Array<ICue>();

    /** Creates a new track
     */
    constructor(
        name: string,
        album: string,
        artist: string,
        measure: number,
        url: string,
        id: string,
        cues: Array<ICue>,
    ) {
        this.Name = name;
        this.Album = album;
        this.Artist = artist;
        this.Measure = measure;
        this.Url = url;
        this.Id = id;
        this.Cues = cues;
    }

    /** Parses the JSON and returns new instance of this class.
     * @remparks Instead of creating an unprototyped object with JSON.parse, this creates a new object of this type
     * @param jsonTrack - a JSON representation of a Track
     * @devdoc See https://stackoverflow.com/a/5874189/79485
     */
    static fromJson(jsonTrack: string): Track {
        const obj = JSON.parse(jsonTrack) as Track;
        const track = new Track(
            obj.Name,
            obj.Album,
            obj.Artist,
            obj.Measure,
            obj.Url,
            obj.Id,
            obj.Cues,
        );
        console.debug('Track::fromJson:'), track;
        return track;
    }
}

/** Implements a Replayer cue
 *  @inheritdoc */
export class Cue implements ICue {
    /**   @inheritdoc */
    Description = '';
    /**   @inheritdoc */
    Id = '';
    /**   @inheritdoc */
    Shortcut = '';
    /**   @inheritdoc */
    Time: number | null = null;
    /**   @inheritdoc */
    Duration: number | null = null;

    /** Creates a new cue
     */
    constructor(
        description: string,
        shortcut: string,
        time: number | null,
        duration: number | null,
        id: string,
    ) {
        this.Description = description;
        this.Shortcut = shortcut;
        this.Time = time;
        this.Duration = duration;
        this.Id = id;
    }

    /** Returns a new, empty cue
     */
    static empty(): Cue {
        return new Cue('', '', 0, 0, '');
    }
}
