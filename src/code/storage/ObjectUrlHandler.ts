/** @class Static functions for storage handling
 * @remarks This is just a wrapper, with some logging functions, suited for better storage debugging handling
 * @devdoc This handles the webkit variant as well
 */
export class ObjectUrlHandler {
    /** Creates and returns a new object URL, plus writes a log using the optional identifier */
    public static createObjectURL(
        blob: Blob,
        identifier: string | null,
    ): string {
        const url = window.URL
            ? window.URL.createObjectURL(blob)
            : window.webkitURL.createObjectURL(blob);
        console.log(
            'ObjectUrlHandler::createObjectUrl:url/id:' +
                `'${url}'/'${identifier}''`,
        );
        return url;
    }

    /** Revokes an object URL, plus writes a log */
    public static revokeObjectURL(url: string): void {
        console.log('ObjectUrlHandler::revokeObjectURL:url:' + `'${url}'`);
        return window.URL
            ? window.URL.revokeObjectURL(url)
            : window.webkitURL.revokeObjectURL(url);
    }
}
