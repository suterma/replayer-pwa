/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import type { IMeter } from '@/code/music/IMeter';
import type { ICue } from './ICue';

/** @interface Defines a Replayer track */
export interface ITrack {
    /** The cues */
    Cues: Array<ICue>;

    /** The playback volume for this track in the range of [0..1].
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

    /** The track's custom pre-roll duration, in [seconds]
     * @remarks If not set, the default pre-roll duration will be used
     */
    PreRoll: number | null;

    /** The track's (coarse, perodically persisted) playhead position, in [seconds].
     * @remarks This is not necessarily exactly the current position in the playing media.
     * This value is intended to be periodically updated only to remember the
     * playback position a track (re-)load. When loading a track,
     * the value will be applied once after a media resource with a player has been mounted.
     * @remarks If not set, zero may be used
     */
    PlayheadPosition: number | null;

    /** The rate at which the track's media is being played back. A value of 1.0, the default, indicates normal speed. */
    PlaybackRate: number;

    /** The name of the track */
    Name: string;

    /** The album name where this track was taken from.
     * @remarks This is a more descriptive information and not intended to uniquely identify an album.
     */
    Album: string;

    /** The musical meter for this track
     * @remark This is only relevant for music tracks.
     */
    Meter: IMeter | null;

    /** Whether to use the measure number to set and display the cue positions */
    UseMeasureNumbers: boolean | null;

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
