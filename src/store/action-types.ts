export enum ActionTypes {
    /** //TODO just an example */
    //PLAY_TRACK = 'PLAY_TRACK',

    /** Retrieves the last stored compilation from the persistent storage, including all blobs and the selected cue,
     * and commits it all into the store as the current compilation*/
    RETRIEVE_COMPILATION = 'RETRIEVE_COMPILATION',

    /** Adds a blob as a media source, using a name and a blob  */
    ADD_MEDIA_BLOB = 'ADD_MEDIA_BLOB',

    /** Loads a single file or package from an URL
     * @remarks The content might be a package or single file of any supported content.
     * @remarks This method can be called multiple times, each resource gets appropriately added to the current compilation
     * @param url - The URL to load the file from
     * @return A locally usable name, derived from the URL, which can be used to match the track to the stored media file
     */
    LOAD_FROM_URL = 'LOAD_FROM_URL',
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
}
