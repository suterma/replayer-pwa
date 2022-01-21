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
            /*neverShowWelcomeMessageAgain*/ false,
            /*autoRetrieveLastCompilation*/ true,
            /*preventScreenTimeout*/ false,
            /*useHowlerJsAudioEngine*/ true,
            /*fadeInDuration*/ 1000,
            /*fadeOutDuration*/ 500,
            /*applyFadeInOffset*/ true,
        );
    }
    /** Whether to never show the welcome message at application start
     * @remarks Default is false (show the message)
     */
    neverShowWelcomeMessageAgain;

    /** Whether to automatically retrieve the last compilation on startup, if available and not overridden by a URL parameter
     * @remarks Default is true (auto retrieve)
     */
    autoRetrieveLastCompilation;

    /** Whether to always keep the screen lit while a track is in use
     * @remarks Default is false
     */
    preventScreenTimeout;

    /** Whether to use the alternative HowlerJs audio engine
     * @remarks Default is false
     */
    useHowlerJsAudioEngine;

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

    /** Parses the JSON and returns new instance of this class, with the defined values applied.
     * @remarks For udefined values, the application default is used.
     * @remarks Instead of creating an unprototyped object with JSON.parse, this creates a new object of this type
     * @param jsonSettings - a JSON representation of Settings
     */
    static fromJson(jsonSettings: string): Settings {
        const obj = JSON.parse(jsonSettings) as Settings;
        const settings = Settings.default();
        if (obj.neverShowWelcomeMessageAgain != undefined) {
            settings.neverShowWelcomeMessageAgain =
                obj.neverShowWelcomeMessageAgain;
        }
        if (obj.autoRetrieveLastCompilation != undefined) {
            settings.autoRetrieveLastCompilation =
                obj.autoRetrieveLastCompilation;
        }
        if (obj.preventScreenTimeout != undefined) {
            settings.preventScreenTimeout = obj.preventScreenTimeout;
        }
        if (obj.useHowlerJsAudioEngine != undefined) {
            settings.useHowlerJsAudioEngine = obj.useHowlerJsAudioEngine;
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
        return settings;
    }

    /** Creates new settings
     */
    constructor(
        neverShowWelcomeMessageAgain: boolean,
        autoRetrieveLastCompilation: boolean,
        preventScreenTimeout: boolean,
        useHowlerJsAudioEngine: boolean,
        fadeInDuration: number,
        fadeOutDuration: number,
        applyFadeInOffset: boolean,
    ) {
        this.neverShowWelcomeMessageAgain = neverShowWelcomeMessageAgain;
        this.autoRetrieveLastCompilation = autoRetrieveLastCompilation;
        this.preventScreenTimeout = preventScreenTimeout;
        this.useHowlerJsAudioEngine = useHowlerJsAudioEngine;
        this.fadeInDuration = fadeInDuration;
        this.fadeOutDuration = fadeOutDuration;
        this.applyFadeInOffset = applyFadeInOffset;
    }
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
