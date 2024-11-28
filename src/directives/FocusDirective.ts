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

import { type DirectiveBinding } from 'vue';

/** A directive that focuses the component's root element after it has been mounted
 */

export function FocusDirective(
    el: HTMLElement,
    binding: DirectiveBinding<any>,
) {
    // Handle the active/inactive state (active by default)
    const isActive = (binding.value as unknown as boolean | null) ?? true;

    if (isActive) {
        el.focus();
    }
}
