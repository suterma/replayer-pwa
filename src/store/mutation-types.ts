export enum MutationTypes {
    /** Initiates the display of a progress message by pushing the message onto the stack of progress messages */
    PUSH_PROGRESS_MESSAGE = 'PUSH_PROGRESS_MESSAGE',
    /** Ends the display of a previous progress message, by popping the message from the stack of progress messages */
    POP_PROGRESS_MESSAGE = 'POP_PROGRESS_MESSAGE',
    /** Ends the display any previous progress message, by clearing all messages from the stack of progress messages */
    FINISH_PROGRESS = 'FINISH_PROGRESS',
    /** Adds a media blob URL to the store
     * @remarks A new blob URL replaces any existing with an exact same path.
     */
    ADD_MEDIA_URL = 'ADD_MEDIA_URL',
    /** Replaces the current compilation with a new one */
    REPLACE_COMPILATION = 'REPLACE_COMPILATION',
    /** Updates the currently selected cue, for application-wide handling
     * @remarks This does not control the playback itself. It is intended for display and handling purposes.
     */
    UPDATE_SELECTED_CUE = 'UPDATE_SELECTED_CUE',
    /** Closes an existing compilation
     * @remarks Removes the compilation with all data, including the media files
     */
    CLOSE_COMPILATION = 'CLOSE_COMPILATION',
    /** Updates the value whether to never show the welcome message again */
    UPDATE_NEVER_SHOW_WELCOME_MESSAGE_AGAIN = 'UPDATE_NEVER_SHOW_WELCOME_MESSAGE_AGAIN',
    /** Initializes the application state from the persisted state during startup.
     * @remarks This provides continuous state over app restarts and should be called when the app is created
     * @remarks This is distinct from the more heavy-weight retrieval of the previously used compilation.
     * @devdoc This is a synchronous operation, to make sure, the state is immediately available. It uses the Local Storage as persistence layer.
     */
    INIT_APPLICATION_STATE = 'INIT_APPLICATION_STATE',
}
