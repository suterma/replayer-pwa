export enum ActionTypes {
    /** Discards the current compilation
     * @remarks Permanently removes the compilation with all data, including the media files and the object URL references to it from
     * both the persistent storage and the application store. Clears the selected cue.
     */
    DISCARD_COMPILATION = 'DISCARD_COMPILATION',

    /** Adds a blob as a media source, using a name and a blob  */
    ADD_MEDIA_BLOB = 'ADD_MEDIA_BLOB',

    /** Removes a track from the compilation */
    REMOVE_TRACK = 'REMOVE_TRACK',

    /** Clones the track in the compilation */
    CLONE_TRACK = 'CLONE_TRACK',

    /** Loads a single file or package from an URL
     * @remarks The content might be a package or single file of any supported content.
     * @remarks This method can be called multiple times, each resource gets appropriately added to the current compilation
     * @param url - The URL to load the file from
     * @return A locally usable name, derived from the URL, which can be used to match the track to the stored media file
     */
    LOAD_FROM_URL = 'LOAD_FROM_URL',
    /** Uses a single media file from and URL, by applying the URL to the set of stored media URLs.
     * @remarks The resource must be a single media file.
     * @remarks This method can be called multiple times, each URL gets appropriately added to the current compilation
     * @param url - The URL to use
     * @return A locally usable name, derived from the URL, which can be used to match the track to the stored media URL
     */
    USE_MEDIA_FROM_URL = 'USE_MEDIA_FROM_URL',
    /** Loads a single file or package from the local file system
     * @remarks The item might be a package or single file of any supported content.
     * @remarks This method can be called multiple times, each resource gets appropriately added to the current compilation
     * @param filename - The URL to load the file from
     */
    LOAD_FROM_FILE = 'LOAD_FROM_FILE',

    /** Initiates the download of the current compilation as a single XML (.rex) file
     */
    DOWNLOAD_REX_FILE = 'DOWNLOAD_REX_FILE',
    /** Initiates the download of the current compilation as a ZIP (.rez) package
     */
    DOWNLOAD_REZ_PACKAGE = 'DOWNLOAD_REZ_PACKAGE',

    /** Updates the compilation title with a new value
     */
    UPDATE_COMPILATION_TITLE = 'UPDATE_COMPILATION_TITLE',
    /** Updates the track data with a new values
     */
    UPDATE_TRACK_DATA = 'UPDATE_TRACK_DATA',
    /** Updates the cue data with a new values
     */
    UPDATE_CUE_DATA = 'UPDATE_CUE_DATA',
    /** Adds a new cue with the given time
     */
    ADD_CUE = 'ADD_CUE',
    /** Deletes the cue with the given Id
     */
    DELETE_CUE = 'DELETE_CUE',

    /** Completely resests all data and settings to the initial (default) state */
    RESET_APPLICATION = 'RESET_APPLICATION',
}
