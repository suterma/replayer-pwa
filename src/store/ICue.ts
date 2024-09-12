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

/** @interface Defines a Replayer cue */

export interface ICue {
    /** A short description of the cue, e.g. "Verse 1" or "Chorus" */
    Description: string | null;

    /** Remarks to this cue, e.g. performance instructions */
    Remarks: string | null;

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

    /** Whether to omit the possibly defined default/track pre-roll for this cue. */
    OmitPreRoll: boolean;

    /** Whether to omit the possibly defined default/track fade-in for this cue. */
    OmitFadeIn: boolean;
}
