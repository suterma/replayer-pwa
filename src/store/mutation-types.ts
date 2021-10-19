export enum MutationTypes {
    /** Initiates the display of a progress message by setting a text */
    SET_PROGRESS_MESSAGE = 'SET_PROGRESS_MESSAGE',
    /** Ends the display of a previous progress message, by setting the message to null */
    END_PROGRESS = 'END_PROGRESS',
    ADD_FILE_URL = 'ADD_FILE_URL',
    /** Updates the intenal with newly available data */
    UPDATE_COMPILATION_FROM_XML = 'UPDATE_COMPILATION_FROM_XML',
    /** Updates the intenal with newly available data */
    UPDATE_COMPILATION_FROM_PLIST = 'UPDATE_COMPILATION_FROM_PLIST',
    /** Updates the currently set cue, for application-wide handling
     * @remarks This does not control the playback itself. It is intended for display purposes.
     */
    UPDATE_CURRENT_CUE = 'UPDATE_CURRENT_CUE',
    /** Closes an existing compilation */
    CLOSE_COMPILATION = 'CLOSE_COMPILATION',
}
