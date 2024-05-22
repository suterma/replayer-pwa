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

/** A view mode for tracks. Specifying this mode makes track components reusable
 * for different track view modes.
 * @remarks NOTE: Currently, the track view mode is entirely dependend to the
 * routed view. This allows eg. the track view mode of edit only on the routed
 * edit view. This may change in the future, e.g. allowing a single track in
 * an edit track view mode, even when another route, like, e.g. the play route,
 * is active.
 * @devdoc Using a view mode instead of separated components allows for
 * continued playback on media tracks, when chaning the mode, which is
 * a key feature in Replayer.
 */

export enum TrackViewMode {
    /** The track is shown with editable inputs for the contained data */
    Edit = 'EDIT',
    /** The track is shown optimized for multi-track/mixer playback */
    Mix = 'MIX',
    /** The track is shown optimized for playback */
    Play = 'PLAY',
}
