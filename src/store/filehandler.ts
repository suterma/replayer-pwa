/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

import type JSZip from 'jszip';
import { MediaBlob, ZipMimeTypes } from './types';
import useLog from '@/composables/LogComposable';
const { log } = useLog();

/**
 * Provides handling methods for package, media and compilation files,
 * originating both from the local file system or an online resource.
 */
export default class FileHandler {
    /** Returns the response content as a promise that resolves with a file
     * @remarks This works similar to the the Response.blob() function,
     * but returns a file and additionally provides some progress information.
     * @param {Response} response - the response to read the content from.
     * The body and headers, especially the content length, are expected to be available
     * @param {(progress: number) => void} update - the callback function to
     * use for periodic update. The progress is reported as percentage.
     */
    static async getFileWithProgress(
        response: Response,
        update: (progress: number) => void,
    ): Promise<File> {
        //Check whether MIME Type is supported
        const responseUrl = new URL(response.url);
        const contentType = FileHandler.getResponseMimeType(
            responseUrl,
            response,
        );
        if (!(contentType && FileHandler.isSupportedMimeType(contentType))) {
            return Promise.reject(
                `Content MIME type '${contentType}' is not supported`,
            );
        }

        if (!response.body) {
            return Promise.reject('Response body is missing');
        }
        const reader = response.body.getReader();

        // get total length
        const contentLength =
            parseInt(response.headers.get('Content-Length') ?? '') ??
            Number.NaN;

        // read the data
        let receivedLength = 0; // received that many bytes at the moment
        const chunks = []; // array of received binary chunks (comprises the body)
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            chunks.push(value);
            receivedLength += value.length;

            // report progress in percent
            if (contentLength > 0) {
                const progress = (receivedLength / contentLength) * 100;
                update(progress);
            }
        }

        // return as file
        const localResourceName = FileHandler.getLocalResourceName(responseUrl);
        const file = new File(chunks, localResourceName /* as name */, {
            type: contentType,
        });
        return file;
    }

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

    /** The set of supported media mime types
     * @remarks Array of mime type strings */
    static supportedMediaMimeTypes = [
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
        'application/pdf' /*PDF*/,
        /** Video */
        'video/mp4' /*MP4 video*/,
        'video/webm' /*WebM video*/,
        'video/ogg' /*Ogg Theora video*/,
    ];

    /** The set of supported package mime types
     * @remarks Array of mime type strings */
    static supportedPackageMimeTypes = [
        'application/zip' /* zip, officially registered by IANA*/,
        'application/octet-stream' /* arbitrary binary data */,
        'application/x-zip-compressed' /* zip, non-standard */,
        'binary/octet-stream' /*zip, very unofficial, used by adonia */,
    ];

    /** The set of supported XML mime types
     * @remarks Array of mime type strings */
    static supportedXmlMimeTypes = [
        'application/xml' /*xml*/,
        'text/xml' /*xml*/,
    ];

    /** The set of supported text mime types
     * @remarks Array of mime type strings */
    static supportedTextMimeTypes = ['text/plain' /*text*/];

    /** The set of supported PDF types
     * @remarks Array of PDF type strings */
    static supportedPdfMimeTypes = ['application/pdf' /*PDF*/];

    /** The overall set of supported mime types
     * @remarks This is a union of all specifically supported mime types */
    static supportedMimeTypes = [
        ...new Set([
            ...FileHandler.supportedMediaMimeTypes,
            ...FileHandler.supportedPackageMimeTypes,
            ...FileHandler.supportedXmlMimeTypes,
            ...FileHandler.supportedTextMimeTypes,
            ...FileHandler.supportedPdfMimeTypes,
        ]),
    ];

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

    /** Returns whether the given path/filename has no file extension
     */
    static hasNoFileEnding(urlPath: string): boolean {
        const urlPathDotParts = urlPath?.split('.');
        const urlPathHasEnding = urlPathDotParts.length > 1;
        const urlPathEnding = urlPathDotParts.pop();
        const urlPathEndingIs3Or4Characters =
            urlPathEnding?.length &&
            urlPathEnding?.length >= 3 &&
            urlPathEnding?.length <= 4;
        return !urlPathHasEnding || !urlPathEndingIs3Or4Characters;
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
    static isSupportedMimeType(type: string | undefined | null): boolean {
        if (
            this.isSupportedPackageMimeType(type) ||
            this.isSupportedCompilationMimeType(type) ||
            this.isSupportedMediaMimeType(type)
        ) {
            return true;
        }
        return false;
    }

    /** Returns whether the given file name (by it's extension) is any of the supported types by Replayer
     * @param {string | undefined} fileName - the filename to test; for media files this also can be a full URL
     */
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
        return FileHandler.FileExtensionMatch(fileName, ['zip']);
    }

    /** Returns whether the given file name (by it's extension) is a supported compilation file name by Replayer
     * @remarks XML (.xml) data is always considered a Compilation in this context
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
     * @param {string | undefined} fileName - the filename to test, which also can be a full URL
     * @remarks Currently, some audio, video, youtube plus txt, pdf, with name variations, are supported
     */
    static isSupportedMediaFileName(fileName: string | undefined): boolean {
        let isSupportedMediaFileName = false;
        if (fileName && !FileHandler.isMacOsxMetadataFile(fileName)) {
            if (
                this.isAudioFileName(fileName) ||
                this.isVideoFileName(fileName) ||
                this.isYouTubeUrl(fileName) ||
                this.isTextFileName(fileName) ||
                this.isPdfFileName(fileName)
            ) {
                isSupportedMediaFileName = true;
            }
        }
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
                'pdf',
                'txt',
                /* xml with highest priority (rex is supported for historical reasons) */
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
     * @param {string} fileName - the filename to test, which also can be a full URL
     * @devdoc track types should later be determined by MIME type.
     * For this, the MIME type should become part of the (readonly) track information,
     * determined when the track URL is evaluated.
     */
    static isVideoFileName(fileName: string): boolean {
        const name = fileName.split('?')[0] ?? ''; //remove query from URL's

        return FileHandler.FileExtensionMatch(name, [
            'mp4',
            'm4v',
            'webm',
            'ogv',
        ]);
    }

    /** Returns whether the given file name (by prefix/suffix) is a supported audio file name by Replayer
     * @param {string} fileName - the filename to test, which also can be a full URL
     * @devdoc track types should later be determined by MIME type.
     * For this, the MIME type should become part of the (readonly) track information,
     * determined when the track URL is evaluated.
     */
    static isAudioFileName(fileName: string): boolean {
        const name = fileName.split('?')[0] ?? ''; //remove query from URL's
        return FileHandler.FileExtensionMatch(name, [
            'mp3',
            'wav',
            'wave',
            'flac',
            'ogg',
            'aiff',
            'aif',
            'aac',
            'm4a',
        ]);
    }

    /** Returns whether the given file name (by prefix/suffix) is a supported text file name by Replayer
     * @param {string} fileName - the filename to test, which also can be a full URL
     * @devdoc track types should later be determined by MIME type.
     * For this, the MIME type should become part of the (readonly) track information,
     * determined when the track URL is evaluated.
     */
    static isTextFileName(fileName: string): boolean {
        const name = fileName.split('?')[0] ?? ''; //remove query from URL's
        return FileHandler.FileExtensionMatch(name, ['txt']);
    }

    /** Returns whether the given file name (by prefix/suffix) is a supported PDF file name by Replayer
     * @param {string} fileName - the filename to test, which also can be a full URL
     * @devdoc track types should later be determined by MIME type.
     * For this, the MIME type should become part of the (readonly) track information,
     * determined when the track URL is evaluated.
     */
    static isPdfFileName(fileName: string): boolean {
        const name = fileName.split('?')[0] ?? ''; //remove query from URL's
        return FileHandler.FileExtensionMatch(name, ['pdf']);
    }

    /** Returns whether the given MIME type is a supported package MIME type by Replayer
     * @devdoc See https://stackoverflow.com/a/72232884/79485 about mime types
     */
    static isSupportedPackageMimeType(
        type: string | undefined | null,
    ): boolean {
        return !!type && FileHandler.supportedPackageMimeTypes.includes(type);
    }

    /** Returns whether the given MIME type is a supported compilation MIME type by Replayer
     * @remarks XML data is always considered a Compilation in this context
     */
    static isSupportedCompilationMimeType(
        type: string | undefined | null,
    ): boolean {
        return !!type && FileHandler.supportedXmlMimeTypes.includes(type);
    }

    /** Returns whether the given MIME type is a supported XML compilation MIME type by Replayer
     */
    static isXmlMimeType(type: string | undefined | null): boolean {
        return !!type && FileHandler.supportedXmlMimeTypes.includes(type);
    }

    /** Returns whether the given MIME type is a supported text file MIME type by Replayer
     */
    static isTextMimeType(type: string | undefined | null): boolean {
        return !!type && FileHandler.supportedTextMimeTypes.includes(type);
    }

    /** Returns whether the given MIME type is a supported PDF file MIME type by Replayer
     */
    static isPdfMimeType(type: string | undefined | null): boolean {
        return !!type && FileHandler.supportedPdfMimeTypes.includes(type);
    }

    /** Returns whether the given MIME type is a supported media MIME type by Replayer
     * @remarks Currently, MIME types for various audio, video, plus plain text and PDF, are supported.
     */
    static isSupportedMediaMimeType(type: string | undefined | null): boolean {
        //Check for supported MIME types (see https://stackoverflow.com/a/29672957)
        return !!type && FileHandler.supportedMediaMimeTypes.includes(type);
    }

    /** Gets the content MIME type from a fetch response
     * @remarks Applies some educated guess in case the content type is not available from the response headers
     */
    static getResponseMimeType(url: URL, response: Response): string | null {
        const contentType = response.headers.get('Content-Type');
        let mimeType = null;
        //Try to get the MIME type from the content type
        if (contentType) {
            log.debug('FileHandler::getMimeType:contentType', contentType);
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

    /** Gets the file extension (part after the last dot) of a filename, in lower case
     */
    static getFileExtension(fileName: string): string | undefined {
        return fileName?.split('.').pop()?.toLowerCase();
    }

    /** Gets a guessed MIME type from a filename, using an expected extension
     * @remarks Applies some educated guess
     */
    static getFileMimeType(fileName: string): string | null {
        const fileExtension = this.getFileExtension(fileName);
        log.debug(
            'CompilationParser::getFileMimeType:fileExtension',
            fileExtension,
        );
        let mimeType = null;
        // audio
        if (fileExtension == 'mp3') {
            mimeType = ZipMimeTypes.AUDIO_MPEG /*mp3*/;
        } else if (fileExtension == 'wav' || fileExtension == 'wave') {
            mimeType = ZipMimeTypes.AUDIO_WAV /*wav*/;
        } else if (fileExtension == 'flac') {
            mimeType = ZipMimeTypes.AUDIO_FLAC /*flac*/;
        } else if (fileExtension == 'ogg') {
            mimeType = ZipMimeTypes.AUDIO_OGG /*ogg*/;
        } else if (fileExtension == 'aiff' || fileExtension == 'aif') {
            mimeType = ZipMimeTypes.AUDIO_AIFF /*aiff*/;
        } else if (fileExtension == 'aac' || fileExtension == 'm4a') {
            mimeType = ZipMimeTypes.AUDIO_AAC /*aac*/;
        }
        // video
        else if (fileExtension == 'webm') {
            mimeType = ZipMimeTypes.VIDEO_WEBM;
        } else if (fileExtension == 'mp4' || fileExtension == 'm4v') {
            mimeType = ZipMimeTypes.VIDEO_MP4;
        } else if (fileExtension == 'ogv') {
            mimeType = ZipMimeTypes.VIDEO_OGG;
        } else if (
            fileExtension == 'zip' ||
            fileExtension == 'rez' /* rez is supported for historical reasons */
        ) {
            mimeType = ZipMimeTypes.APPLICATION_ZIP;
        } else if (
            fileExtension == 'xml' ||
            fileExtension == 'rex' /* rex is supported for historical reasons */
        ) {
            mimeType = ZipMimeTypes.TEXT_XML;
        } else if (fileExtension == 'txt') {
            mimeType = ZipMimeTypes.TEXT_PLAIN;
        } else if (fileExtension == 'pdf') {
            mimeType = ZipMimeTypes.APPLICATION_PDF;
        }

        return mimeType;
    }

    /** Asserts whether the file represents an XML compilation file
     */
    public static isXmlFile(file: File): boolean {
        return this.isXmlFileName(file.name) || this.isXmlMimeType(file.type);
    }

    /** Asserts whether the file name represents an XML compilation file
     * @remarks (rex is supported for historical reasons)
     */
    public static isXmlFileName(fileName: string): boolean {
        return FileHandler.FileExtensionMatch(fileName, ['rex', 'xml']);
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
        log.debug('CompilationParser::handleAsMediaContent');
        const blob = new Blob([content], {
            type: FileHandler.getFileMimeType(mediaFileName) ?? undefined,
        });
        return new MediaBlob(mediaFileName, blob);
    }

    /** Whether the given filename's extionsion matches any of the provided extensions
     * @param {string | undefined} fileName - the filename to test
     * @param {string[]} extensions - a set of extensions to compare against. Expected to be lower case.
     * @remarks The lower case variant of the file extension is compared.
     */
    public static FileExtensionMatch(
        fileName: string | undefined,
        extensions: string[],
    ): boolean {
        if (fileName) {
            const fileExtension = this.getFileExtension(fileName);
            if (fileExtension) {
                if (extensions.includes(fileExtension.toLowerCase())) {
                    return true;
                }
            }
        }
        return false;
    }

    public static BytesPerMegaByte = 1024 * 1024;
}
