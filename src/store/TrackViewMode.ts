/** A view mode for tracks. Specifying this mode makes the track component reusable for different view modes. */

export enum TrackViewMode {
    /** Shown with editable inputs for the contained data */
    Edit = 'EDIT',
    /** Shown optimized for multi-track/mixer playback */
    Mix = 'MIX',
    /** Shown optimized for playback */
    Play = 'PLAY',
}
