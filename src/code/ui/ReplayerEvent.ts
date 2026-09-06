/** A set of Replayer application events that can be
 * emitted from Replayer-internal input handlers and
 * consumed from suitable components. */
export enum ReplayerEvent {
    BACK_TO_CUE = 'backtocue',
    TO_NEXT_CUE = 'tonextcue',
    TO_PREV_CUE = 'topreviouscue',
    TO_MNEMONIC_CUE = 'tomnemoniccue',
    //TODO must be implemented at the suitable level. Offer an Option to either use next cue as default for replayer or next track.
    TO_NEXT_TRACK = 'tonexttrack',
    //TODO must be implemented at the suitable level. Offer an Option to either use next cue as default for replayer or next track.
    TO_PREV_TRACK = 'toprevioustrack',
    /** Starts or stops playback at the current position, depending on the current state. Honors pre-roll and fade operations, if applicable. */
    TOGGLE_PLAYBACK = 'toggleplayback',
    /** Start/resume playback at the current position, when paused. Honors pre-roll and fade operations, if applicable. */
    PLAY = 'play',
    /** Stops playback at the current position, when playing. Honors pre-roll and fade operations, if applicable. */
    PAUSE = 'pause',
    /** Rewinds 5 seconds */
    REWIND = 'rewind',
    /** Forwards 5 seconds */
    FORWARD = 'forward',
    VOLUME_DOWN = 'volumedown',
    VOLUME_UP = 'volumeup',
}
