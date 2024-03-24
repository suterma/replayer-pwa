/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

/** A view mode for tracks. Specifying this mode makes the track component reusable for different view modes. */

export enum TrackViewMode {
    /** Shown with editable inputs for the contained data */
    Edit = 'EDIT',
    /** Shown optimized for multi-track/mixer playback */
    Mix = 'MIX',
    /** Shown optimized for playback */
    Play = 'PLAY',
}
