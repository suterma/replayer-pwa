import { v4 as uuidv4 } from 'uuid';

export enum CompilationType {
    /** XML Compilation type, currently the only one supported */
    XML = 'XML',
}

/** A display mode for tracks. Specifying this mode makes the track component reusable for different display modes. */
export enum TrackDisplayMode {
    /** Shown with editable inputs for the contained data */
    Edit = 'edit',
    /** Shown optimized for playback */
    Play = 'play',
}

/** A playback mode for tracks and cues. */
export enum PlaybackMode {
    /** Play to the end of the track */
    PlayTrack = 'PlayTrack',
    /** Plays the track in a loop */
    LoopTrack = 'LoopTrack',
    /** Plays to the end of the cue */
    PlayCue = 'PlayCue',
    /** Plays the cue in a loop */
    LoopCue = 'LoopCue',
    /** Plays all tracks of the compilation in a loop */
    LoopCompilation = 'LoopCompilation',
    /** Plays all tracks of the compilation in random order */
    ShuffleCompilation = 'ShuffleCompilation',
}

/** @interface Defines a Replayer Compilation, consisting of a set of tracks with their cues.
 * @remarks This definition corresponds to the definitions in https://github.com/suterma/Replayer/blob/master/SOURCE/Replayer.Model/ICompilation.cs for the classic WinForms Replayer
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

    /** The playback mode.
     * @remarks This can be set by the user, and is persisted.
     */
    PlaybackMode: PlaybackMode;
}
/** @interface Defines a Replayer track */
export interface ITrack {
    /** The cues */
    Cues: Array<ICue>;

    /** The playback volume for this track.
     * @remarks This can be set by the user, and is persisted.
     */
    Volume: number;

    /** The extracted duration of the loaded media file for this track.
     * @remarks This is only defined if there is a loaded media file for this track.
     * @devdoc This must get calculated/reset if the track is loaded/unloaded. It must never get persisted.
     */
    Duration: number | null;

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

    /** The URL or the local file name (possibly including a path) for the media file.
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
     * @remarks To work correctly, this identifier must be unique among all currently loaded compilations. Best, to make it universally unique by using a UUID.
     * @devdoc This identifier allows to recognise this item over multiple edits
     */
    Id: string;
    /** A mnemonic that can serve as keyboard shortcut for this cue */
    Shortcut: string | null;
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
    PlaybackMode: PlaybackMode = PlaybackMode.PlayTrack;

    /** Creates a new compilation
     * @param playbackMode {playbackMode} - Playback mode. This is persisted in the application state for user convenience.
     */
    constructor(
        mediaPath: string,
        title: string,
        url: string,
        id: string,
        tracks: Array<ITrack>,
        playbackMode: PlaybackMode,
    ) {
        this.MediaPath = mediaPath;
        this.Title = title;
        this.Url = url;
        this.Id = id;
        this.Tracks = tracks;
        this.PlaybackMode = playbackMode;
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
                    track.Duration,
                    track.Volume ?? DefaultTrackVolume,
                );
            }),
            obj.PlaybackMode ?? PlaybackMode.PlayTrack /** default */,
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
            uuidv4(),
            new Array<ITrack>(),
            PlaybackMode.PlayTrack,
        );
    }
}

/** The default track volume */
export const DefaultTrackVolume = 0.5;

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
        measure: number,
        url: string,
        id: string,
        cues: Array<ICue>,
        duration: number | null,
        volume: number,
    ) {
        this.Name = name;
        this.Album = album;
        this.Artist = artist;
        this.Measure = measure;
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
            obj.Measure,
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

/** Implements a Replayer cue
 *  @inheritdoc */
export class Cue implements ICue {
    /**   @inheritdoc */
    Description = '';
    /**   @inheritdoc */
    Id = '';
    /**   @inheritdoc */
    Shortcut: string | null = null;
    /**   @inheritdoc */
    Time: number | null = null;
    /**   @inheritdoc */
    Duration: number | null = null;

    /** Creates a new cue
     */
    constructor(
        description: string,
        shortcut: string | null,
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
