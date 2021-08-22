export enum CompilationType {
    /** XML Compilation type, currently the only one supported */
    XML = 'XML',
}

/** @interface Defines a rehearsal Compilation, consisting of a set of tracks with their cuepoints.
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

    /** The globally unique Id
     * @remarks This globally unique identifiers allows to recognise this item over multiple edits
     */
    Id: string;

    /** The set of tracks */
    Tracks: Array<ITrack>;
}
/** @interface Defines a Replayer track */
export interface ITrack {
    Cues: Array<ICue>;
    /** The artist */
    Artist: string;
    /** The name of the track */
    Name: string;

    /** The album name where this track was taken from.
     * @remarks This is a more descriptive information and not intended to uniquely identify an album.
     */
    Album: string;
    /** The measure in beats per minute. */
    Measure: number;

    /** The URL for the media file.
     * @remarks Currently, only local file paths are supported.
     * @devdoc If it is relative, it may get made absolute using the compilation's media path.
     */
    Url: string;

    /** The globally unique Id
     * @remarks This globally unique identifiers allows to recognise this item over multiple edits
     */
    Id: string;
}

/** @interface Defines a Replayer cue */
export interface ICue {
    Description: string;
    Id: string;
    Shortcut: string;
    Time: string;
}

/** Implements a rehearsal Compilation, consisting of a set of tracks with their cuepoints.
 *  @inheritdoc */
export class Compilation implements ICompilation {
    // /** @constructor
    //  * @param {Array<ITrack>} tracks - The set of tracks
    //  */
    // constructor(tracks: Array<ITrack>) {
    //     this.Tracks = tracks;
    // }
    Type: CompilationType = CompilationType.XML;
    MediaPath = '';
    Title = '';
    Url = '';
    Id = '';
    Tracks: Array<ITrack> = new Array<ITrack>();
}

/** Implements a Replayer track
 *  @inheritdoc */
export class Track implements ITrack {
    Cues: Array<ICue> = new Array<ICue>();
    Artist = '';
    Name = '';
    Album = '';
    Measure = 0;
    Url = '';
    Id = '';
}
