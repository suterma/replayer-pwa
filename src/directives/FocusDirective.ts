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

/** A directive that focuses the component's root element after it has been mounted
 */
export const FocusDirective = {
    // called when the bound element's parent component
    // and all its children are mounted.
    mounted(el: HTMLElement) {
        el.focus();
    },
};
