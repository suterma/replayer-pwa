import FileHandler from './filehandler';

/** @class Implements a playable media URL for local resources
 * @remarks A media URL is an annotated URL, consisting of
 * - an object URL for a blob, representing a media file
 * - the full name (including a possible path) of the original media file (from the disk or from within a REZ/ZIP-file)
 */
export class MediaUrl {
    /** @constructor
     * @param {string} resourceName - A name for the resource.
     * For online URL's: a simplified resource name, derived from the URL;
     * For files: the full name (including a possible path) of the original media file (from the disk or from within a REZ/ZIP-file)
     * @param {string} url - The online URL, or an object URL representing the playable blob
     */
    constructor(
        resourceName: string,
        url: string,
        size: number | null,
        mediaType: string | null,
    ) {
        this.resourceName = resourceName;
        this.url = url;
        this.size = size;
        this.mediaType = mediaType;
    }
    /** A name for the resource.
     * For online URL's: a simplified resource name, derived from the URL;
     * For files: the full name (including a possible path) of the original media file (from the disk or from within a REZ/ZIP-file) */
    resourceName: string;
    /** The online URL, or an object URL representing the playable blob */
    url: string;

    /** The size of the content in bytes
     * @remarks This is typically only used for media files from the disk or from within a REZ/ZIP-file.
     */
    size: number | null;

    /** The MIME type of the content
     * @remarks This is typically only used for media files from the disk or from within a REZ/ZIP-file.
     */
    mediaType: string | null;

    /** Gets the source of the media.
     * For online URL's: the full URL (from the url property);
     * For files: the full name (from the resourceName property) */
    public get source(): string {
        if (FileHandler.isValidHttpUrl(this.url)) {
            return this.url;
        }
        return this.resourceName;
    }
}

/** @class Implements a named media blob
 * @remarks A media blob contains playable binary content with a name
 */
export class MediaBlob {
    /** @constructor
     * @param {string} fileName - The full name (including a possible path) of the original media file (from the disk or from within a REZ/ZIP-file)
     * @param {Blob} blob - The blob with playable binary content
     */
    constructor(fileName: string, blob: Blob) {
        this.fileName = fileName;
        this.blob = blob;
    }
    /** The full name (including a possible path) of the original media file (from the disk or from within a REZ/ZIP-file)  */
    fileName: string;

    /** The playable blob  */
    blob: Blob;
}

/** The set of supported mime type in a REZ container
 * //HINT: maybe use a lib like https://www.npmjs.com/package/mime-types for this
 */
export enum RezMimeTypes {
    AUDIO_MPEG = 'audio/mpeg',
    AUDIO_WAV = 'audio/x-wav',
    AUDIO_FLAC = 'audio/flac',
    AUDIO_OGG = 'audio/ogg',
    AUDIO_AIFF = 'audio/aiff',
    AUDIO_AAC = 'audio/aac',
    VIDEO_WEBM = 'video/webm',
    VIDEO_MP4 = 'video/mp4',
    VIDEO_OGG = 'video/ogg',
    APPLICATION_ZIP = 'application/zip',
    TEXT_XML = 'text/xml',
    TEXT_PLAIN = 'text/plain',
}
