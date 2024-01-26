/** A set of Replayer events that are emitted by this Keyboard handler */
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

    /** Triggers terminal cleanup/persistence operations when the browser/tab closes/reloads */
    CLEAN_UP = 'cleanup',
}
