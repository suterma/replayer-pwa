import type JSZip from 'jszip';
import { MediaBlob, RezMimeTypes } from './types';

/**
 * Provides handling methods for package, media and compilation files,
 * originating both from the local file system or an online resource.
 */
export default class FileHandler {
    /** Get the size in MB, rounded to one decimal place */
    static AsMegabytes(sizeInBytes: number | null): number | null {
        if (sizeInBytes === 0) {
            return sizeInBytes;
        } else if (sizeInBytes) {
            const size = sizeInBytes / FileHandler.BytesPerMegaByte;
            return Math.round(size * 10) / 10;
        }
        return null;
    }
    /** The set of accepted file extensions */
    static acceptedFileList =
        '.rex,.xml,.rez,.zip,.mp3,.wav,.wave,.flac,.ogg,.aiff,.aif,.aac,.m4a,.mp4,.m4v,.webm,.ogv,.txt';

    /** Returns whether the given path represents a Mac OS X resource fork.
     * @remarks Mac OS X resource forks are not processed by Replayer.
     */
    static isMacOsxResourceFork(path: string): boolean {
        const macOsxResourceFork = /.*(__MACOSX).*(\._).*/i;
        if (path.match(macOsxResourceFork)) {
            return true;
        }
        return false;
    }

    /** Returns whether the given file name represents a Mac OS X metadata file.
     * @remarks Mac OS X metadata files are not processed by Replayer.
     */
    static isMacOsxMetadataFile(fileName: string): boolean {
        return fileName.startsWith('._');
    }

    /** Returns whether the given string is a path
     * @remarks When ending with a slash, it's considered a path.
     */
    static isPath(input: string): boolean {
        return input.endsWith('/');
    }

    /** Maps a URL to a locally usable file name
     * @remarks can be used to match a track URL to a stored media file
     * @devdoc Just removes the protocol
     * @devdoc Full URL's (with protocol) are not usable for Replayer here
     *  as file names because they will be invalid as path insided a ZIP archive.
     */
    static getLocalResourceName(url: URL): string {
        return url.toString().replace(/^(https?:|)\/\//, '');
    }

    /** Reads the blob content as text.
     * @devdoc This does intentionally not use Blob.text()
     * because there is no polyfill readily available in vite.
     * At least some iPadOS devices do not have Blob.text() method implmented
     */
    static ReadAsText(content: Blob): Promise<String> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function () {
                const text = reader.result;
                if (typeof text === 'string') {
                    resolve(text);
                } else {
                    reject('The given blob can not be read as text');
                }
            };
            reader.onabort = function (/*event: ProgressEvent*/) {
                reject('Reading the given blob has been aborted');
            };
            reader.onerror = function (/*event: ProgressEvent*/) {
                reject(`Reading the given blob failed due to an error`);
            };
            reader.readAsText(content);
        });
    }

    /** Tries to infer useful track metadata from the URL, by splitting the URL into parts, if possible.
     * @remarks The artist is not guessed, it's always empty.
     */
    static extractTrackMetadataFromUrl(url: URL): {
        name: string;
        artist: string;
        album: string;
    } {
        const fileName = this.extractFileNameFromUrl(url);
        const decodedFileName = decodeURI(fileName);
        const trackName = this.extractTrackNameFromFileName(decodedFileName);

        // Tries to infer a useful album name from the URL, by using the second level domain name, if possible.
        const album = url.hostname.split('.').reverse()[1] ?? '';

        return { name: trackName, artist: '', album: album };
    }

    /** Tries to infer a useful track name from the file name.
     * @remarks can be used to get a human readable name for a Track, which originates from a file name
     */
    static extractTrackNameFromFileName(fileName: string): string {
        const simpleFilename = FileHandler.removeExtension(fileName);
        const cleanedFileName = simpleFilename
            .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>]/gi, ' ')
            .replace(/\s{2,}/g, ' ');
        return FileHandler.getAllAfterLastSlash(cleanedFileName);
    }

    /** Returns the last part, after the last slash
     * @remarks For a complete typical path, this effectively returns the file name
     */
    static getAllAfterLastSlash(pathName: string): string {
        return pathName.substring(
            pathName.lastIndexOf('/') + 1,
            pathName.length,
        );
    }

    static removeExtension(filename: string): string {
        const lastDotPosition = filename.lastIndexOf('.');
        if (lastDotPosition === -1) return filename;
        else return filename.substr(0, lastDotPosition);
    }

    /** Tries to infer a correct file name from the URL, by splitting on the path, if possible.
     */
    private static extractFileNameFromUrl(url: URL): string {
        const pathName = url.pathname;
        const pathParts = pathName.split('/');
        const fileName = pathParts.pop(); //the latest item is considered a file name

        if (fileName) {
            return fileName;
        }
        if (pathName) {
            return pathName;
        }

        return url.hostname;
    }

    /** Returns whether the given file name (by it's extension) is a downloadable media file name by Replayer
     * @remarks Downloadable are all online media files except YouTube URL's.
     */
    static isDownloadableMediaFileName(fileName: string | undefined): boolean {
        if (
            fileName &&
            this.isSupportedMediaFileName(fileName) &&
            !this.isYouTubeUrl(fileName)
        ) {
            return true;
        }
        return false;
    }

    /** Returns whether this file is supported by Replayer, either by MIME type or the file name (by prefix/suffix) */
    static isSupportedFile(file: File): boolean {
        if (
            this.isSupportedMimeType(file.type) ||
            this.isSupportedFileName(file.name)
        ) {
            return true;
        }
        return false;
    }

    /** Asserts whether the file represents a media file
     * @remarks Currently, mp3, wav, flac, ogg, aiff, plus text are supported
     */
    public static isSupportedMediaFile(file: File): boolean {
        return (
            this.isSupportedMediaFileName(file.name) ||
            this.isSupportedMediaMimeType(file.type)
        );
    }

    /** Asserts whether the file represents a package file
     */
    public static isSupportedPackageFile(file: File): boolean {
        return (
            this.isSupportedPackageFileName(file.name) ||
            this.isSupportedPackageMimeType(file.type)
        );
    }

    /** Returns whether the given MIME type is any of the supported types by Replayer
     */
    static isSupportedMimeType(type: string | undefined): boolean {
        if (
            this.isSupportedPackageMimeType(type) ||
            this.isSupportedCompilationMimeType(type) ||
            this.isSupportedMediaMimeType(type)
        ) {
            return true;
        }
        return false;
    }

    /** Returns whether the given file name (by prefix/suffix) is any of the supported types by Replayer */
    static isSupportedFileName(fileName: string | undefined): boolean {
        if (
            this.isSupportedPackageFileName(fileName) ||
            this.isSupportedCompilationFileName(fileName) ||
            this.isSupportedMediaFileName(fileName)
        ) {
            return true;
        }
        return false;
    }
    /** Returns whether the given file name (by it's extension) is a supported package file name by Replayer
     */
    static isSupportedPackageFileName(fileName: string | undefined): boolean {
        let isSupportedPackageFileName = false;
        if (fileName) {
            const fileExtension = this.getFileExtension(fileName);
            if (fileExtension) {
                if (['zip', 'rez' /*replayer zip*/].includes(fileExtension)) {
                    isSupportedPackageFileName = true;
                }
            }
        }

        console.debug(
            `filehander::isSupportedPackageFileName:fileName:'${fileName}' is isSupportedPackage?:'${isSupportedPackageFileName}'`,
        );
        return isSupportedPackageFileName;
    }

    /** Returns whether the given file name (by it's extension) is a supported compilation file name by Replayer
     * @remarks XML (.rex, .xml) data is always considered a Compilation in this context
     */
    static isSupportedCompilationFileName(
        fileName: string | undefined,
    ): boolean {
        if (fileName) {
            return this.isXmlFileName(fileName);
        }
        return false;
    }
    /** Returns whether the given file name (by prefix/suffix) is a supported media file name by Replayer
     * @remarks Currently, some audio, video, youtube plus txt, with name variations, are supported
     */
    static isSupportedMediaFileName(fileName: string | undefined): boolean {
        let isSupportedMediaFileName = false;
        if (fileName && !FileHandler.isMacOsxMetadataFile(fileName)) {
            if (
                this.isAudioFileName(fileName) ||
                this.isVideoFileName(fileName) ||
                this.isYouTubeUrl(fileName) ||
                this.isTextFileName(fileName)
            ) {
                isSupportedMediaFileName = true;
            }
        }

        // console.debug(
        //     `filehandler::isSupportedMediaFileName:fileName:'${fileName}' is isSupportedMedia?:'${isSupportedMediaFileName}'`,
        // );
        return isSupportedMediaFileName;
    }

    /** Returns whether the given file name (by prefix/suffix) is a processable file by Replayer
     * @remarks Processable are all supported files of any type (compilations, media, including text)
     */
    static isProcessableFileName(fileName: string | undefined): boolean {
        if (fileName) {
            if (FileHandler.isMacOsxResourceFork(fileName)) {
                return false;
            }
            return (
                FileHandler.isSupportedCompilationFileName(fileName) ||
                FileHandler.isSupportedMediaFileName(fileName)
            );
        }
        return false;
    }

    /** A comparison function for ordered file extraction from a ZIP package/archive
     * @remarks This is intended to produce the compilation first, then by guessed ascending file size
     */
    static compareZipEntries(
        zipEntryA: JSZip.JSZipObject,
        zipEntryB: JSZip.JSZipObject,
    ): number {
        const fileExtensionA = FileHandler.getFileExtension(zipEntryA.name);
        const fileExtensionB = FileHandler.getFileExtension(zipEntryB.name);

        // both equally defined or both undefined
        if (fileExtensionA === fileExtensionB) {
            // somewhat arbitrarily by file name (lenght is not guessed)
            return zipEntryA.name.localeCompare(zipEntryB.name);
        }

        // only one is undefined
        if (
            (fileExtensionA === null ||
                fileExtensionA === undefined ||
                fileExtensionA === '') &&
            fileExtensionB
        ) {
            return -1;
        } else if (
            fileExtensionA &&
            (fileExtensionB === null ||
                fileExtensionB === undefined ||
                fileExtensionB === '')
        ) {
            return 1;
        } else if (fileExtensionA && fileExtensionB) {
            // both are defined, but they are not equal
            const priority = [
                /* unknown is possibly larger */
                'mp3',
                'txt',
                /* xml with highest priority */
                'xml',
                'rex',
            ];

            const priorityA = priority.indexOf(fileExtensionA);
            const priorityB = priority.indexOf(fileExtensionB);

            if (priorityA < priorityB) {
                return 1;
            }
            if (priorityA > priorityB) {
                return -1;
            }
        }
        return 0;
    }

    /** Returns whether the given URL is for a YouTube video
     */
    static isYouTubeUrl(url: string): boolean {
        const youTube = /^(https?:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/;
        return youTube.test(url);
    }

    /** Returns whether the given file name (by prefix/suffix) is a supported video file name by Replayer
     * @devdoc track types should later be determined by MIME type.
     * For this, the MIME type should become part of the (readonly) track information,
     * determined when the track URL is evaluated.
     */
    static isVideoFileName(fileName: string): boolean {
        const name = fileName.split('?')[0] ?? ''; //remove query from URL's
        return (
            name.endsWith('.mp4') ||
            name.endsWith('.m4v') ||
            name.endsWith('.webm') ||
            name.endsWith('.ogv')
        );
    }

    /** Returns whether the given file name (by prefix/suffix) is a supported audio file name by Replayer
     * @devdoc track types should later be determined by MIME type.
     * For this, the MIME type should become part of the (readonly) track information,
     * determined when the track URL is evaluated.
     */
    static isAudioFileName(fileName: string): boolean {
        const name = fileName.split('?')[0] ?? ''; //remove query from URL's
        return (
            name.endsWith('.mp3') ||
            name.endsWith('.wav') ||
            name.endsWith('.wave') ||
            name.endsWith('.flac') ||
            name.endsWith('.ogg') ||
            name.endsWith('.aiff') ||
            name.endsWith('.aif') ||
            name.endsWith('.aac') ||
            name.endsWith('.m4a')
        );
    }

    /** Returns whether the given file name (by prefix/suffix) is a supported text file name by Replayer
     * @devdoc track types should later be determined by MIME type.
     * For this, the MIME type should become part of the (readonly) track information,
     * determined when the track URL is evaluated.
     */
    static isTextFileName(fileName: string): boolean {
        const name = fileName.split('?')[0] ?? ''; //remove query from URL's
        return name.endsWith('.txt');
    }

    /** Returns whether the given MIME type is a supported package MIME type by Replayer
     * @devdoc See https://stackoverflow.com/a/72232884/79485 about mime types
     */
    static isSupportedPackageMimeType(type: string | undefined): boolean {
        return (
            !!type &&
            [
                'application/zip' /* zip, officially registered by IANA*/,
                'application/octet-stream' /* arbitrary binary data */,
                'application/x-zip-compressed' /* zip, non-standard */,
                'binary/octet-stream' /*z ip, very unofficial, used by adonia */,
            ].includes(type)
        );
    }

    /** Returns whether the given MIME type is a supported compilation MIME type by Replayer
     * @remarks XML data is always considered a Compilation in this context
     */
    static isSupportedCompilationMimeType(type: string | undefined): boolean {
        return (
            !!type &&
            ['application/xml' /*xml*/, 'text/xml' /*xml*/].includes(type)
        );
    }

    /** Returns whether the given MIME type is a supported XML compilation MIME type by Replayer
     */
    static isXmlMimeType(type: string | undefined): boolean {
        return (
            !!type &&
            ['application/xml' /*xml*/, 'text/xml' /*xml*/].includes(type)
        );
    }

    /** Returns whether the given MIME type is a supported text file MIME type by Replayer
     */
    static isTextMimeType(type: string | undefined): boolean {
        return !!type && ['text/plain' /*text*/].includes(type);
    }

    /** Returns whether the given MIME type is a supported media MIME type by Replayer
     * @remarks Currently, MIME types for various audio, video, plus plain text, are supported.
     */
    static isSupportedMediaMimeType(type: string | undefined): boolean {
        //Check for supported MIME types (see https://stackoverflow.com/a/29672957)
        return (
            !!type &&
            [
                /** Audio */
                'audio/mp3' /*mp3, by chrome*/,
                'audio/mpeg' /*mp3*/,
                'audio/vnd.wave' /*wav*/,
                'audio/wav' /*wav*/,
                'audio/wave' /*wav*/,
                'audio/x-wav' /*wav*/,
                'audio/flac' /*flac*/,
                'application/ogg' /*ogg*/,
                'audio/ogg' /*ogg*/,
                'audio/vorbis' /*ogg*/,
                'audio/vorbis-config' /*ogg*/,
                'audio/x-aiff' /*aiff*/,
                'audio/aiff' /*aiff*/,
                'audio/aac' /*aac*/,
                'text/plain' /*plain text*/,
                /** Video */
                'video/mp4' /*MP4 video*/,
                'video/webm' /*WebM video*/,
                'video/ogg' /*Ogg Theora video*/,
            ].includes(type)
        );
    }

    /** Gets the content MIME type from a fetch response
     * @remarks Applies some educated guess in case the content type is not available from the response headers
     */
    static getResponseMimeType(
        url: URL,
        response: Response,
    ): string | undefined {
        const contentType = response.headers.get('Content-Type');
        let mimeType = undefined;
        //Try to get the MIME type from the content type
        if (contentType) {
            console.debug('FileHandler::getMimeType:contentType', contentType);
            //However, Replayer does currently only use the bare mime type, omitting any probable charset
            mimeType = contentType.split(';')[0];
        }
        //If no MIME type available, or it's just a generic one, try to guess the correct MIME type from the URL
        if (!mimeType || mimeType == 'application/octet-stream') {
            const fileName = this.extractFileNameFromUrl(url);
            mimeType = this.getFileMimeType(fileName);
        }
        return mimeType;
    }

    /** Gets the file extension (part after the last dot) of a filename
     */
    static getFileExtension(fileName: string): string | undefined {
        return fileName?.split('.').pop()?.toLowerCase();
    }

    /** Gets a guessed MIME type from a filename, using an expected extension
     * @remarks Applies some educated guess
     */
    static getFileMimeType(fileName: string): string | undefined {
        const fileExtension = this.getFileExtension(fileName);
        console.debug(
            'CompilationParser::getFileMimeType:fileExtension',
            fileExtension,
        );
        let mimeType = undefined;
        // audio
        if (fileExtension == 'mp3') {
            mimeType = RezMimeTypes.AUDIO_MPEG /*mp3*/;
        } else if (fileExtension == 'wav' || fileExtension == 'wave') {
            mimeType = RezMimeTypes.AUDIO_WAV /*wav*/;
        } else if (fileExtension == 'flac') {
            mimeType = RezMimeTypes.AUDIO_FLAC /*flac*/;
        } else if (fileExtension == 'ogg') {
            mimeType = RezMimeTypes.AUDIO_OGG /*ogg*/;
        } else if (fileExtension == 'aiff' || fileExtension == 'aif') {
            mimeType = RezMimeTypes.AUDIO_AIFF /*aiff*/;
        } else if (fileExtension == 'aac' || fileExtension == 'm4a') {
            mimeType = RezMimeTypes.AUDIO_AAC /*aac*/;
        }
        // video
        else if (fileExtension == 'webm') {
            mimeType = RezMimeTypes.VIDEO_WEBM;
        } else if (fileExtension == 'mp4' || fileExtension == 'm4v') {
            /** Video */
            mimeType = RezMimeTypes.VIDEO_MP4;
        } else if (fileExtension == 'ogv') {
            /** Video */
            mimeType = RezMimeTypes.VIDEO_OGG;
        } else if (fileExtension == 'zip' || fileExtension == 'rez') {
            /** Package/Compilation */
            mimeType = RezMimeTypes.APPLICATION_ZIP /*zip*/;
        } else if (fileExtension == 'xml' || fileExtension == 'rex') {
            mimeType = RezMimeTypes.TEXT_XML /*xml*/;
        } else if (fileExtension == 'txt') {
            /** Text */
            mimeType = RezMimeTypes.TEXT_PLAIN /*text*/;
        }

        return mimeType;
    }

    /** Asserts whether the file represents an XML compilation file
     * @remarks Currently, xml, rex are supported
     */
    public static isXmlFile(file: File): boolean {
        return this.isXmlFileName(file.name) || this.isXmlMimeType(file.type);
    }

    /** Asserts whether the file name represents an XML compilation file */
    public static isXmlFileName(fileName: string): boolean {
        const isXmlFileName =
            fileName.toLowerCase().endsWith('.rex') ||
            fileName.toLowerCase().endsWith('.xml');
        return isXmlFileName;
    }

    /** Determines whether the string contains a valid URL, starting with the http|https protocol.
     * @returns true, when the URL is valid, false otherwise.
     */
    public static isValidHttpUrl(url: string): boolean {
        let parsedUrl;

        try {
            parsedUrl = new URL(url);
        } catch (_) {
            return false;
        }

        return (
            parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
        );
    }

    /** Handles the given filename and blob as having media content and converts it into a MediaBlob
     * @remarks Guesses the MIME type from the file name extension
     * @devdoc This is used when a file is read from the ZIP package and not yet available as blob
     */
    public static handleAsMediaContent(
        mediaFileName: string,
        content: Blob,
    ): MediaBlob {
        console.debug('CompilationParser::handleAsMediaContent');
        const blob = new Blob([content], {
            type: FileHandler.getFileMimeType(mediaFileName),
        });
        return new MediaBlob(mediaFileName, blob);
    }

    public static BytesPerMegaByte = 1024 * 1024;
}
