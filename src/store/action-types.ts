export enum ActionTypes {
    /** //TODO just an example */
    //PLAY_TRACK = 'PLAY_TRACK',
    /** Retrieves the last stored compilation from the persistent storage, including all blobs and the selected track,
     * and commits it all into the store as the current compilation*/
    RETRIEVE_COMPILATION = 'RETRIEVE_COMPILATION',
    //   SET_COMPILATION = 'SET_COMPILATION',

    /** Parses and uses the given compilation as the new current compilation, while persistently storing it for later retrieval */
    SET_COMPILATION_FROM_XML = 'SET_COMPILATION_FROM_XML',
    /** Parses and uses the given compilation as the new current compilation, while persistently storing it for later retrieval */
    SET_COMPILATION_FROM_PLIST = 'SET_COMPILATION_FROM_PLIST',
    /** Adds a blob as a media source, using a name and a blob  */
    ADD_MEDIA_BLOB = 'ADD_MEDIA_BLOB',
}
