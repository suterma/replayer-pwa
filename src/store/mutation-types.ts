export enum MutationTypes {
    /** Initiates the display of a progress message by pushing the message onto the stack of progress messages */
    PUSH_PROGRESS = 'PUSH_PROGRESS',
    /** Ends the display of a previous progress message, by popping the message from the stack of progress messages */
    POP_PROGRESS = 'POP_PROGRESS',
    /** Initiates the display of an error message by pushing the message onto the stack of error messages */
    PUSH_ERROR = 'PUSH_ERROR',
    /** Ends the display of a previous error message, by popping the message from the stack of error messages */
    POP_ERROR = 'POP_ERROR',
    /** Ends the display any previous progress message, by clearing all messages from the stack of progress messages */
    FINISH_PROGRESS = 'FINISH_PROGRESS',
    /** Adds a media blob URL to the store.
     * @remarks A new blob URL replaces any existing with an exact same path.
     * @param url - The MediaUrl to use
     */
    ADD_MEDIA_URL = 'ADD_MEDIA_URL',
    /** Adds a new default track for the given file name or media URL to the compilation.
     * @remarks Track properties are derived from the given file name or url
     * @remarks The new track is made the selected track
     * @remarks No media data is added, it must get handled elsewhere.
     */
    ADD_DEFAULT_TRACK = 'ADD_DEFAULT_TRACK',
    /** Adds a provided track to the compilation.
     * @remarks The new track is made the selected track
     * @remarks No media data is added, it must get handled elsewhere.
     */
    ADD_TRACK = 'ADD_TRACK',
    /** Adds (inserts) the new cue for the given track to the compilation, by inserting it by the order in time.
     */
    ADD_CUE = 'ADD_CUE',
    /** Deletes the given cue from the matching track in the compilation
     */
    DELETE_CUE = 'DELETE_CUE',
    /** Replaces the current compilation with a new one
     * @remarks Does not set the selected cue
     * @remarks Removes all data from the previous compilation, including media URL's.
     * @remarks Also immediately updates the media URL storage with the contained online (http|https) URL's from the compilation.
     */
    REPLACE_COMPILATION = 'REPLACE_COMPILATION',

    /** Updates the currently selected cue Id, for application-wide handling
     * @remarks This does not control the playback itself. It is intended for display and handling purposes.
     * @remarks Removes any track id selection.
     */
    UPDATE_SELECTED_CUE_ID = 'UPDATE_SELECTED_CUE_ID',

    /** Updates the currently selected track Id, for application-wide handling
     * @remarks This does not control the playback itself. It is intended for display and handling purposes.
     * @remarks Removes any cue id selection.
     */
    UPDATE_SELECTED_TRACK_ID = 'UPDATE_SELECTED_TRACK_ID',

    /** Sets the track duration. Using the track duration and the existing cues,
     * calculates the durations of all cues, including the last one.
     * @remarks No ordering is done with this operation
     * @remarks The calculated durations are only valid as long as the cues, their times, and the track does not change
     */
    UPDATE_DURATIONS = 'UPDATE_DURATIONS',

    /** Removes an existing track, with it's cues.
     * @remarks Removes the track from the compilation. If the selected cue was one of the track, the selection is cleared.
     */
    REMOVE_TRACK = 'REMOVE_TRACK',

    /** Clones an existing track, with it's cues.
     * @remarks Effectively copies the track, and replaces any previous ids.
     */
    CLONE_TRACK = 'CLONE_TRACK',

    /** Reassigns the cue shortcuts, starting with the first cue's shortcut as seed number */
    REASSIGN_CUE_SHORTCUTS = 'REASSIGN_CUE_SHORTCUTS',

    /** Moves an existing track one position up in the list of tracks.
     */
    MOVE_TRACK_UP = 'MOVE_TRACK_UP',

    /** Moves an existing track one position down in the list of tracks.
     */
    MOVE_TRACK_DOWN = 'MOVE_TRACK_DOWN',

    /** Discards the current compilation
     * @remarks Permanently removes the compilation with all data, including the media files and the object URL references to it from
     * both the persistent storage and the application store. Clears the selected cue.
     */
    DISCARD_COMPILATION = 'DISCARD_COMPILATION',

    /** Revokes all currently known media blob URLs
     * @remarks Use this to avoid memory leaks when abandoning (but not closing) a compilation
     * This is usually the case when the user closes the tab or browser window, without actually closing the compilation.
     */
    REVOKE_ALL_MEDIA_URLS = 'REVOKE_ALL_MEDIA_URLS',

    /** Updates the application settings */
    UPDATE_SETTINGS = 'UPDATE_SETTINGS',

    /** Updates the compilation title
     * @remarks Also updates the persistent store of the compilation
     */
    UPDATE_COMPILATION_TITLE = 'UPDATE_COMPILATION_TITLE',

    /** Updates the track data
     * @remarks Also updates the persistent store of the compilation
     */
    UPDATE_TRACK_DATA = 'UPDATE_TRACK_DATA',

    /** Updates the order of all the tracks of a compilation
     * @remarks Also updates the persistent store of the compilation
     */
    UPDATE_TRACK_ORDER = 'UPDATE_TRACK_ORDER',

    /** Updates the playback mode
     * @remarks Also updates the persistent store of the compilation
     */
    UPDATE_PLAYBACK_MODE = 'UPDATE_PLAYBACK_MODE',

    /** Updates the track volume mode
     * @remarks Also updates the persistent store of the compilation
     */
    UPDATE_TRACK_VOLUME = 'UPDATE_TRACK_VOLUME',

    /** Specifically updates the track media source URL
     * @remarks Also updates the persistent store of the compilation
     */
    UPDATE_TRACK_URL = 'UPDATE_TRACK_URL',

    /** Updates the cue data
     * @remarks Also updates the persistent store of the compilation
     */
    UPDATE_CUE_DATA = 'UPDATE_CUE_DATA',
}
