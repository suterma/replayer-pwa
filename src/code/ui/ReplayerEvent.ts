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

/** A set of Replayer events that are emitted by this Keyboard handler */

//TODO move all the handling of these events to app store

export enum ReplayerEvent {
    BACK_TO_CUE = 'backtocue',
    TO_NEXT_CUE = 'tonextcue',
    TO_PREV_CUE = 'topreviouscue',
    TO_MNEMONIC_CUE = 'tomnemoniccue',
    TOGGLE_PLAYBACK = 'toggleplayback',
    /** Rewinds 5 seconds */
    REWIND = 'rewind',
    /** Forwards 5 seconds */
    FORWARD = 'forward',
    VOLUME_DOWN = 'volumedown',
    VOLUME_UP = 'volumeup',
}
