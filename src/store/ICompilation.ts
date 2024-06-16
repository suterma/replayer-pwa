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

import type { ITrack } from './ITrack';
import { CompilationType } from './CompilationType';

/** @interface Defines a Replayer Compilation, consisting of a set of tracks with their cues.
 * @remarks This definition corresponds to the definitions in https://github.com/suterma/Replayer/blob/master/SOURCE/Replayer.Model/ICompilation.cs for the classic WinForms Replayer
 * The implemented type is advertised as the Type. Using this pattern saves the code from implementing a full blown plugin architecture.
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

    /** The artist for this Compilation. */
    Artist: string;

    /** The album for this Compilation. */
    Album: string;

    /** the URL, where this Compilation is stored. This is used for storage and retrieval of the compilation. */
    Url: string;

    /** A unique identifier for this compilation.
     * @remarks To work correctly, this identifier must be unique among all currenlty loaded compilations. Best, to make it universally unique by using a UUID.
     * @devdoc This identifier allows to recognise this item over multiple edits
     */
    Id: string;

    /** The set of tracks */
    Tracks: Array<ITrack>;

    /** The set of selected track tags
     * @remarks This is used to filter displayed tracks
     */
    SelectedTags: Set<string>;

    /** Whether any of title, album or artist is set to a non-empty value */
    hasLabels(): boolean;
}
