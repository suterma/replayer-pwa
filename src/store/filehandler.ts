import { RezMimeTypes } from './state-types';

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
    static acceptedFileList =
        '.rex,.xml,.rez,.zip,.mp3,.wav,.wave,.flac,.ogg,.aiff,.aif,.aac,.m4a,.bplist';

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

    /** Tries to infer a useful track name from the URL, by splitting on the path, if possible.
     * @remarks can be used to get a human readable name for a Track, which originates from an URL
     */
    static extractTrackNameFromUrl(url: URL): string {
        const fileName = this.extractFileNameFromUrl(url);
        const decodedFileName = decodeURI(fileName);
        return FileHandler.removeExtension(decodedFileName);
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

    /** Tries to infer a useful artist name from the URL, by using the second level domain name, if possible.
     * @remarks can be used to get a human readable artist name for a Track, which originates from an URL
     * @returns A guess for an artist name or the empty string.
     */
    static extractArtistNameFromUrl(url: URL): string {
        return url.hostname.split('.').reverse()[1] ?? '';
    }

    /** Tries to infer a useful album name from the URL, by using the last path section, if possible.
     * @remarks can be used to get a human readable album name for a Track, which originates from an URL
     * @returns A guess for the album name or the empty string.
     */
    static extractAlbumNameFromUrl(url: URL): string {
        const pathName = url.pathname;
        const pathParts = pathName.split('/');
        const albumName = pathParts.reverse()[1];
        return albumName ?? '';
    }

    static removeExtension(filename: string): string {
        const lastDotPosition = filename.lastIndexOf('.');
        if (lastDotPosition === -1) return filename;
        else return filename.substr(0, lastDotPosition);
    }

    /** Tries to infer a correct file name from the URL, by splitting on the path, if possible.
     */
    static extractFileNameFromUrl(url: URL): string {
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
     * @remarks Currently, mp3, wav, flac, ogg, aiff, are supported
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
            const fileExtension = fileName.split('.').pop()?.toLowerCase();
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
     * @remarks XML (.rex, .xml) and bplist data is always considered a Compilation in this context
     */
    static isSupportedCompilationFileName(
        fileName: string | undefined,
    ): boolean {
        if (fileName) {
            return (
                this.isBplistFileName(fileName) || this.isXmlFileName(fileName)
            );
        }
        return false;
    }
    /** Returns whether the given file name (by prefix/suffix) is a supported media file name by Replayer
     * @remarks Currently, mp3, wav, flac, ogg, aiff, with name variations, are supported
     */
    static isSupportedMediaFileName(fileName: string | undefined): boolean {
        let isSupportedMediaFileName = false;
        if (fileName && !FileHandler.isMacOsxMetadataFile(fileName)) {
            const fileExtension = fileName.split('.').pop()?.toLowerCase();
            if (fileExtension) {
                if (
                    [
                        'mp3',
                        'wav',
                        'wave',
                        'flac',
                        'ogg',
                        'aiff',
                        'aif',
                        'aac',
                        'm4a',
                    ].includes(fileExtension)
                ) {
                    isSupportedMediaFileName = true;
                }
            }
        }

        console.debug(
            `filehandler::isSupportedMediaFileName:fileName:'${fileName}' is isSupportedMedia?:'${isSupportedMediaFileName}'`,
        );
        return isSupportedMediaFileName;
    }

    /** Returns whether the given MIME type is a supported package MIME type by Replayer
     */
    static isSupportedPackageMimeType(type: string | undefined): boolean {
        if (type) {
            if (
                [
                    'application/zip' /*zip*/,
                    'application/x-zip-compressed' /*zip*/,
                ].includes(type)
            ) {
                return true;
            }
        }
        return false;
    }

    /** Returns whether the given MIME type is a supported compilation MIME type by Replayer
     * @remarks XML and bplist data is always considered a Compilation in this context
     * @devdoc The types for binary plists are untested
     */
    static isSupportedCompilationMimeType(type: string | undefined): boolean {
        if (type) {
            if (
                [
                    'application/xml' /*xml*/,
                    'text/xml' /*xml*/,
                    'application/x-bplist' /*bplist*/,
                    'application/x-plist' /*binary plist*/,
                ].includes(type)
            ) {
                return true;
            }
        }
        return false;
    }

    /** Returns whether the given MIME type is a supported XML compilation MIME type by Replayer
     */
    static isXmlMimeType(type: string | undefined): boolean {
        if (type) {
            if (
                ['application/xml' /*xml*/, 'text/xml' /*xml*/].includes(type)
            ) {
                return true;
            }
        }
        return false;
    }

    /** Returns whether the given MIME type is a supported media MIME type by Replayer
     * @remarks Currently, MIME types for mp3, wav, flac, ogg, aiff, are supported
     */
    static isSupportedMediaMimeType(type: string | undefined): boolean {
        if (type) {
            //Check for supported MIME types (see https://stackoverflow.com/a/29672957)
            if (
                [
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
                ].includes(type)
            ) {
                return true;
            }
        }
        return false;
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

    /** Gets a guessed MIME type from a filename, using an expected extension
     * @remarks Applies some educated guess
     */
    static getFileMimeType(fileName: string): string | undefined {
        const fileExtension = fileName?.split('.').pop()?.toLowerCase();
        console.debug(
            'CompilationParser::getMimeType:fileExtension',
            fileExtension,
        );
        let mimeType = undefined;
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
        } else if (fileExtension == 'zip' || fileExtension == 'rez') {
            mimeType = RezMimeTypes.APPLICATION_ZIP /*zip*/;
        } else if (fileExtension == 'xml' || fileExtension == 'rex') {
            mimeType = RezMimeTypes.TEXT_XML /*xml*/;
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
        console.debug(
            `filehander::isXmlFileName:fileName:'${fileName}' is XML?:'${isXmlFileName}'`,
        );
        return isXmlFileName;
    }

    /** Asserts whether the file name represents a bplist (Binary Propertylist) compilation file */
    public static isBplistFileName(fileName: string): boolean {
        const isBplistFileName =
            fileName.toLowerCase().endsWith('.bplist') ||
            fileName.toLowerCase().endsWith('playlist');
        console.debug(
            `filehander::isBplistFileName:fileName:'${fileName}' is Bplist?:'${isBplistFileName}'`,
        );
        return isBplistFileName;
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

    public static BytesPerMegaByte = 1024 * 1024;
}
