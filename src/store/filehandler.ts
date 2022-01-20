/**
 * Provides handling methods for package, media and compilation files,
 * originating both from the local file system or an online resource.
 */
export default class FileHandler {
    /** Maps a URL to a locally usable file name
     * @remarks can be used to match a track URL to a stored media file
     * @devdoc Just removes the protocol
     * @devdoc Full URL's (with protocol) are not usable for Replayer here
     *  as file names because they will be invalid as path insided a ZIP archive.
     */
    static getLocalResourceName(url: URL): string {
        return url.toString().replace(/^(https?:|)\/\//, '');
    }

    /** Tries to infer a useful name from the URL, by splitting on the path, if possible.
     * @remarks can be used to get a human readable name for a Track, which originates from an URL
     */
    static extractNameFromUrl(url: URL): string {
        const fileName = this.extractFileNameFromUrl(url);
        const decodedFileName = decodeURI(fileName);
        return FileHandler.removeExtension(decodedFileName);
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

    /** Returns whether this file is supported by Replayer, either by MIME type or the file name (by it's extension).
     */
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
     * @remarks Currently, only mp3 is supported
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

    /** Returns whether the given file name (by it's extension) is any of the supported types by Replayer */
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
        if (fileName) {
            const fileExtension = fileName.split('.').pop()?.toLowerCase();
            if (fileExtension) {
                if (['zip', 'rez' /*replayer zip*/].includes(fileExtension)) {
                    return true;
                }
            }
        }
        return false;
    }

    /** Returns whether the given file name (by it's extension) is a supported compilation file name by Replayer
     * @remarks XML and bplist data is always considered a Compilation in this context
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
    /** Returns whether the given file name (by it's extension) is a supported media file name by Replayer */
    static isSupportedMediaFileName(fileName: string | undefined): boolean {
        if (fileName) {
            const fileExtension = fileName.split('.').pop()?.toLowerCase();
            if (fileExtension) {
                if (['mp3'].includes(fileExtension)) {
                    return true;
                }
            }
        }
        return false;
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

    /** Returns whether the given MIME type is a supported media MIME type by Replayer */
    static isSupportedMediaMimeType(type: string | undefined): boolean {
        if (type) {
            //Check for supported MIME types (see https://stackoverflow.com/a/29672957)
            if (
                ['audio/mp3' /*mp3, by chrome*/, 'audio/mpeg' /*mp3*/].includes(
                    type,
                )
            ) {
                return true;
            }
        }
        return false;
    }

    /** Gets the content MIME type from the response
     * @remarks Applies some educated guess in case the content type is not available from the response headers
     */
    static getMimeType(url: URL, response: Response): string | undefined {
        const contentType = response.headers.get('Content-Type');
        let mimeType = undefined;
        //Try to get the MIME type from the content type
        if (contentType) {
            console.debug('FileHandler::getMimeType:contentType', contentType);
            //However, Replayer does currently only use the bare mime type, omitting any probable charset
            mimeType = contentType.split(';')[0];
        }
        //Otherwise try to guess the MIME type from the URL
        if (!mimeType) {
            const fileName = this.extractFileNameFromUrl(url);
            const fileExtension = fileName?.split('.').pop()?.toLowerCase();
            console.debug(
                'CompilationParser::getMimeType:fileExtension',
                fileExtension,
            );
            if (fileExtension == 'mp3') {
                mimeType = 'audio/mpeg' /*mp3*/;
            } else if (fileExtension == 'zip' || fileExtension == 'rez') {
                mimeType = 'application/zip' /*zip*/;
            } else if (fileExtension == 'xml' || fileExtension == 'rex') {
                mimeType = 'application/xml' /*xml*/;
            }
        }
        return mimeType;
    }

    /** Asserts whether the file represents an XML compilation file */
    public static isXmlFile(file: File): boolean {
        return this.isXmlFileName(file.name);
    }

    /** Asserts whether the file name represents an XML compilation file */
    public static isXmlFileName(fileName: string): boolean {
        return (
            fileName.toLowerCase().endsWith('.rex') ||
            fileName.toLowerCase().endsWith('.xml')
        );
    }

    /** Asserts whether the file name represents a bplist (Binary Propertylist) compilation file */
    public static isBplistFileName(fileName: string): boolean {
        return (
            fileName.toLowerCase().endsWith('.bplist') ||
            fileName.toLowerCase().endsWith('playlist')
        );
    }

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
}
