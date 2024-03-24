/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

/** The Store names
 * @devdoc Follows the naming convention at https://www.typescriptlang.org/docs/handbook/enums.html#string-enums
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
    /** A store for the audio context an related state */
    Audio = 'AUDIO',
}
