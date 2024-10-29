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

export function log(message: String, level?: 'info' | 'warn' | 'error') {
    // WHEN RUNNING WEBPACK WITH `PRODUCTION` build,
    // IT WILL REMOVE THE FOLLOWING CODE.

    // if (NODE_ENV !== 'production') {
    if (level === 'error') {
        console.error(message);
    } else if (level === 'warn') {
        console.warn(message);
    } else {
        console.log(message);
    }
    // }
}
