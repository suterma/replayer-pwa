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

const URL = window.URL || window.webkitURL;

import useLog from '@/composables/LogComposable';
const { log } = useLog();

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
        log.debug(
            'ObjectUrlHandler::createObjectUrl:creating-for:id:' +
                `'${identifier}'`,
        );
        const url = URL.createObjectURL(blob);
        log.info(
            'ObjectUrlHandler::createObjectUrl:created-for:url / id:' +
                `'${url}' / '${identifier}'`,
        );
        return url;
    }

    /** Revokes an object URL, plus writes a log */
    public static revokeObjectURL(url: string): void {
        log.info('ObjectUrlHandler::revokeObjectURL:url:' + `'${url}'`);
        return URL.revokeObjectURL(url);
    }
}
