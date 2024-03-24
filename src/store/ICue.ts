/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

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
     * @remarks This is only defined if there is a subsequent cue, or if it is the last queue in a track, the track length is known.
     * @devdoc This must get recalculated if the set of cues changes, or the track is loaded/unloaded. It must never get persisted.
     */
    Duration: number | null;
}
