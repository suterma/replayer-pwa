/** The Store names
 * @privateRemarks Follows the naming convention at https://www.typescriptlang.org/docs/handbook/enums.html#string-enums
 */
export enum Store {
    /** A store for the media blobs */
    MediaBlob = 'MEDIA_BLOB',
    /** A store for the application settings */
    Settings = 'SETTINGS',
    /** A store for the application level messages */
    Messages = 'MESSAGES',
    /** A store for the application state */
    App = 'APP',
    /** A store for audio-related global state */
    Audio = 'AUDIO',
    /** A store for multitrack audio-related global state */
    Multitrack = 'MULTITRACK',
    /** A store for track-related state, for a single track */
    Track = 'TRACK',
}
