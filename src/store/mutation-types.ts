export enum MutationTypes {
    /** Initiates the display of a progress message by setting a text */
    SET_PROGRESS_MESSAGE = 'SET_PROGRESS_MESSAGE',
    /** Ends the display of a previous progress message, by setting the message to null */
    END_PROGRESS = 'END_PROGRESS',
    /** Adds a media file to the store
     * @remarks A new file replaces any existing file with an exact same path.
     */
    ADD_FILE_URL = 'ADD_FILE_URL',
    /** Updates the intenal with newly available data */
    UPDATE_COMPILATION_FROM_XML = 'UPDATE_COMPILATION_FROM_XML',
    /** Updates the intenal with newly available data */
    UPDATE_COMPILATION_FROM_PLIST = 'UPDATE_COMPILATION_FROM_PLIST',
    /** Updates the currently set cue, for application-wide handling
     * @remarks This does not control the playback itself. It is intended for display purposes.
     */
    UPDATE_CURRENT_CUE = 'UPDATE_CURRENT_CUE',
    /** Closes an existing compilation
     * @remarks Removes the compilation with all data, including the media files
     */
    CLOSE_COMPILATION = 'CLOSE_COMPILATION',
    /** Updates the value whether to never show the welcome message again */
    UPDATE_NEVER_SHOW_WELCOME_MESSAGE_AGAIN = 'UPDATE_NEVER_SHOW_WELCOME_MESSAGE_AGAIN',
    /** Initializes the store with the persisted state
     * @remarks This provides continuous state over app restarts and should be called when the app is created
     */
    INIT_STORE = 'INIT_STORE',
}
