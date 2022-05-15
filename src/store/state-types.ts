import FileHandler from './filehandler';

/** @enum An enumeration of display modes
 *  @remarks Defines the intention of the display layout and feature set
 */
export enum DisplayMode {
    /** A mode for playback during a rehearsal. Optimised for simple and fast playback handling */
    Play = 'PLAY',
    /** A mode for creating and editing items */
    Edit = 'EDIT',
}

/** @class Implements the application settings
 */
export class Settings {
    /** Returns the settings with their default value */
    static default(): Settings {
        return new Settings(
            /*autoRetrieveLastCompilation*/ true,
            /*preventScreenTimeout*/ true,
            /*fadeInDuration*/ 1000,
            /*fadeOutDuration*/ 500,
            /*applyFadeInOffset*/ true,
            /*displayExperimentalContent*/ false,
            /*keyboardShortcutTimeout*/ 1000,
        );
    }

    /** Whether to automatically retrieve the last compilation on startup, if available and not overridden by a URL parameter
     * @remarks Default is true (auto retrieve)
     */
    autoRetrieveLastCompilation;

    /** Whether to always keep the screen lit while a track is in use
     * @remarks Default is false
     */
    preventScreenTimeout;

    /** The fade-in duration in [milliseconds]. Use zero for no fading.
     * @remarks Default is 1000
     */
    fadeInDuration;

    /** The fading duration in [milliseconds]. Use zero for no fading.
     * @remarks Default is 500.
     */
    fadeOutDuration;

    /** Whether to apply an offset for fade-in operations, to compensate for the fading duration
     * @remarks Default is true
     */
    applyFadeInOffset;

    /** Whether to show experimental content
     * @remarks Default is false
     */
    displayExperimentalContent;

    /** A timeout duration, used for the mnemonic build-up as well as the keyboard shortcut display timeout
     */
    keyboardShortcutTimeout;

    /** Parses the JSON and returns new instance of this class, with the defined values applied.
     * @remarks For udefined values, the application default is used.
     * @remarks Instead of creating an unprototyped object with JSON.parse, this creates a new object of this type
     * @param jsonSettings - a JSON representation of Settings
     */
    static fromJson(jsonSettings: string): Settings {
        const obj = JSON.parse(jsonSettings) as Settings;
        const settings = Settings.default();
        if (obj.autoRetrieveLastCompilation != undefined) {
            settings.autoRetrieveLastCompilation =
                obj.autoRetrieveLastCompilation;
        }
        if (obj.preventScreenTimeout != undefined) {
            settings.preventScreenTimeout = obj.preventScreenTimeout;
        }
        if (obj.fadeInDuration != undefined) {
            settings.fadeInDuration = obj.fadeInDuration;
        }
        if (obj.fadeOutDuration != undefined) {
            settings.fadeOutDuration = obj.fadeOutDuration;
        }
        if (obj.applyFadeInOffset != undefined) {
            settings.applyFadeInOffset = obj.applyFadeInOffset;
        }
        if (obj.displayExperimentalContent != undefined) {
            settings.displayExperimentalContent =
                obj.displayExperimentalContent;
        }
        if (obj.keyboardShortcutTimeout != undefined) {
            settings.keyboardShortcutTimeout = obj.keyboardShortcutTimeout;
        }

        return settings;
    }

    /** Creates new settings
     */
    constructor(
        autoRetrieveLastCompilation: boolean,
        preventScreenTimeout: boolean,
        fadeInDuration: number,
        fadeOutDuration: number,
        applyFadeInOffset: boolean,
        displayExperimentalContent: boolean,
        keyboardShortcutTimeout: number,
    ) {
        this.autoRetrieveLastCompilation = autoRetrieveLastCompilation;
        this.preventScreenTimeout = preventScreenTimeout;
        this.fadeInDuration = fadeInDuration;
        this.fadeOutDuration = fadeOutDuration;
        this.applyFadeInOffset = applyFadeInOffset;
        this.displayExperimentalContent = displayExperimentalContent;
        this.keyboardShortcutTimeout = keyboardShortcutTimeout;
    }
}

/** @class Implements a playable media URL
 * @remarks A media URL is an annotated URL; either an online URL (with http|https protocol), or an object URL for a blob, representing a media file
 */
export class MediaUrl {
    /** Creates a new MediaUrl object from an online URL, with the file name derived from the URL.
     * @remarks An online URL is a valid URL starting with the protocol http|https.
     * @param {string} url - The online URL
     */
    static FromOnlineUrl(url: string): MediaUrl {
        const finalUrl = new URL(url);
        const localResourceName = FileHandler.getLocalResourceName(finalUrl);
        return new MediaUrl(localResourceName, url);
    }
    /** @constructor
     * @param {string} resourceName - A name for the resource.
     * For online URL's: a simplified resource name, derived from the URL;
     * For files: the full name (including a possible path) of the original media file (from the disk or from within a REZ/ZIP-file)
     * @param {string} url - The online URL, or an object URL representing the playable blob
     */
    constructor(resourceName: string, url: string) {
        this.resourceName = resourceName;
        this.url = url;
    }
    /** A name for the resource.
     * For online URL's: a simplified resource name, derived from the URL;
     * For files: the full name (including a possible path) of the original media file (from the disk or from within a REZ/ZIP-file) */
    resourceName: string;
    /** The online URL, or an object URL representing the playable blob */
    url: string;
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
    APPLICATION_ZIP = 'application/zip',
    TEXT_XML = 'text/xml',
    APPLICATION_XBPLIST = 'application/x-bplist',
}
