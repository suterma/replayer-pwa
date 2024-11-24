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

import { useElementScroll } from '@/composables/ElementScrollComposable';
import { type DirectiveBinding } from 'vue';

/** A directive that vertically scrolls to the component's root element,
 * after it has been mounted
 * @remarks With modifiers, the scrolling can be to the top or
 * just to the visible app area (this excludes the footer and header nav bar)
 * Using a boolean value, the scrolling can be activated / deactivated.
 */
export function ScrollDirective(
    el: HTMLElement,
    binding: DirectiveBinding<any>,
) {
    // Handle the active/inactive state (active by default)
    const isActive = (binding.value as unknown as boolean | null) ?? true;

    const { scroll } = useElementScroll(el, { onlyInvisible: (binding.modifiers.visible === true) });

    if (isActive) {
        scroll();
    }
}
