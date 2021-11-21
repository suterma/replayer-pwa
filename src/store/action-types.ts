export enum ActionTypes {
    /** //TODO just an example */
    PLAY_TRACK = 'PLAY_TRACK',
    /** Retrieves the last compilation from the persistent storage, and commits it into the store as the current compilation*/
    RETRIEVE_COMPILATION = 'RETRIEVE_COMPILATION',
    //   SET_COMPILATION = 'SET_COMPILATION',

    /** Parses and uses the given compilation as the new current compilation, while persistently storing it for later retrieval */
    SET_COMPILATION_FROM_XML = 'SET_COMPILATION_FROM_XML',
    /** Parses and uses the given compilation as the new current compilation, while persistently storing it for later retrieval */
    SET_COMPILATION_FROM_PLIST = 'SET_COMPILATION_FROM_PLIST',
}
