/** @class Implements the application options
 */
export class Options {
    /** Whether to never show the welcome message at application start
     * @remarks Default is false (show the message)
     */
    neverShowWelcomeMessageAgain = false;

    /** Whether to automatically retrieve the last compilation on startup, if available
     * @remarks Default is true (auto retrieve)
     */
    autoRetrieveLastCompilation = true;
}

/** @class Implements a playable media URL
 * @remarks A media URL is an annotated object URL for a blob, representing a media file
 */
export class MediaUrl {
    /** @constructor
     * @param {string} fileName - The name of the original media file (from the disk or from within a REZ/ZIP-file)
     * @param {string} objectUrl - The object URL representing the playable blob
     */
    constructor(fileName: string, objectUrl: string) {
        this.fileName = fileName;
        //TODO make sure object urls for directly loaded files are directly used for the object url, see https://stackoverflow.com/a/49346614
        this.objectUrl = objectUrl;
    }
    /** The name of the original media file (from the disk or from within a REZ/ZIP-file)  */
    fileName: string;
    /** The object URL representing the playable blob  */
    objectUrl: string;
}

/** @class Implements a named media blob
 * @remarks A media blob contains playable content with a name
 */
export class MediaBlob {
    /** @constructor
     * @param {string} fileName - The name of the original media file (from the disk or from within a REZ/ZIP-file)
     * @param {Blob} blob - The blob with playable content
     */
    constructor(fileName: string, blob: Blob) {
        this.fileName = fileName;
        this.blob = blob;
    }
    /** The name of the original media file (from the disk or from within a REZ/ZIP-file)  */

    fileName: string;
    /** The playable blob  */
    blob: Blob;
}

/** The set of supported mime type in a REZ container */
export enum RezMimeTypes {
    AUDIO_MP3 = 'audio/mp3',
    TEXT_XML = 'text/xml',
    APPLICATION_XBPLIST = 'application/x-bplist',
}
