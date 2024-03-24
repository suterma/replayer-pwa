/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

const URL = window.URL || window.webkitURL;

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
        console.debug(
            'ObjectUrlHandler::createObjectUrl:creating-for:id:' +
                `'${identifier}'`,
        );
        const url = URL.createObjectURL(blob);
        console.log(
            'ObjectUrlHandler::createObjectUrl:created-for:url / id:' +
                `'${url}' / '${identifier}'`,
        );
        return url;
    }

    /** Revokes an object URL, plus writes a log */
    public static revokeObjectURL(url: string): void {
        console.log('ObjectUrlHandler::revokeObjectURL:url:' + `'${url}'`);
        return URL.revokeObjectURL(url);
    }
}
