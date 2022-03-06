export enum MutationTypes {
    /** Initiates the display of a progress message by pushing the message onto the stack of progress messages */
    PUSH_PROGRESS_MESSAGE = 'PUSH_PROGRESS_MESSAGE',
    /** Ends the display of a previous progress message, by popping the message from the stack of progress messages */
    POP_PROGRESS_MESSAGE = 'POP_PROGRESS_MESSAGE',
    /** Initiates the display of an error message by pushing the message onto the stack of error messages */
    PUSH_ERROR_MESSAGE = 'PUSH_ERROR_MESSAGE',
    /** Ends the display of a previous error message, by popping the message from the stack of error messages */
    POP_ERROR_MESSAGE = 'POP_ERROR_MESSAGE',
    /** Ends the display any previous progress message, by clearing all messages from the stack of progress messages */
    FINISH_PROGRESS = 'FINISH_PROGRESS',
    /** Adds a media blob URL to the store
     * @remarks A new blob URL replaces any existing with an exact same path.
     */
    ADD_MEDIA_URL = 'ADD_MEDIA_URL',
    /** Adds a new track for the given media URL to the compilation
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
    /** Replaces the current compilation with a new one, and selects the first cue
     * @remarks This can be used to make sure that any a cue is selected for the new compilation,
     * in order to present the user with an immediately dispatchable play action
     * @remarks Removes all data from the previous compilation, including media URL's.
     * @remarks Also immediately updates the media URL storage with the contained online (http|https) URL's from the compilation.
     */
    REPLACE_COMPILATION_AND_SELECT_FIRST_CUE = 'REPLACE_COMPILATION_AND_SELECT_FIRST_CUE',

    /** Updates the currently selected cue Id, for application-wide handling
     * @remarks This does not control the playback itself. It is intended for display and handling purposes.
     */
    UPDATE_SELECTED_CUE_ID = 'UPDATE_SELECTED_CUE_ID',
    /** Using the provided track duration, calculates the cue duration of all cues of the track.
     * @remarks No ordering is done with this operation
     */
    UPDATE_CUE_DURATIONS = 'UPDATE_CUE_DURATIONS',

    /** Removes an existing track, with it's cues.
     * @remarks Removes the track from the compilation. If the selected cue was one of the track, the selection is cleared.
     */
    REMOVE_TRACK = 'REMOVE_TRACK',

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
    /** Retrieves the application settings from the persisted store during startup.
     * @remarks This provides continuous settings over app restarts and should be called when the app is created
     * @remarks These settings can also be used for (light-weight) application state, not only option-type settings.
     * However, these settings here are  distinct from the more heavy-weight store and retrieval of the previously used compilation.
     * @devdoc This is a synchronous operation, to make sure, the settings are immediately available. It uses the Local Storage as persistence layer.
     */
    RETRIEVE_SETTINGS = 'RETRIEVE_SETTINGS',

    /** Updates the compilation title
     * @remarks Also updates the persitent store of the compilation
     */
    UPDATE_COMPILATION_TITLE = 'UPDATE_COMPILATION_TITLE',

    /** Updates the track data
     * @remarks Also updates the persitent store of the compilation
     */
    UPDATE_TRACK_DATA = 'UPDATE_TRACK_DATA',

    /** Specifically updates the track media source URL
     * @remarks Also updates the persitent store of the compilation
     */
    UPDATE_TRACK_URL = 'UPDATE_TRACK_URL',

    /** Updates the cue data
     * @remarks Also updates the persitent store of the compilation
     */
    UPDATE_CUE_DATA = 'UPDATE_CUE_DATA',
}
