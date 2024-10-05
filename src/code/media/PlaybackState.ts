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

/** A set of (playback) states for a track's media resource */
export enum PlaybackState {
    /** Track media is unavailable (Could not be fetched or was not found). */
    Unavailable = 'UNAVAILABLE',
    /** Track is not loaded (but available) */
    Unloaded = 'UNLOADED',

    /** Track is loaded and ready to play (e.g. paused)
     * @remarks This is emitted for the first time when the media element has
     * loaded enough data to actually start playback.
     * Note that the underlying implementation might handle it in a special way,
     * e.g. on iOS where it is initially emitted prematurely (because iOS
     * is requiring an additional user click before actually being able to play),
     */
    Ready = 'READY',
    /** The media is currently playing */
    Playing = 'PLAYING',
}
