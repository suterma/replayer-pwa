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

import { useElementBounding, useWindowScroll } from '@vueuse/core';
import { type DirectiveBinding } from 'vue';

/** A directive that vertically scrolls to the component's root element,
 * after it has been mounted
 * @remarks With modifiers, the scrolling can be to the top or
 * just to the visible app area (this excludes the footer and header nav bar)
 */
export function ScrollDirective(
    el: HTMLElement,
    binding: DirectiveBinding<any>,
) {
    const { y: windowVerticalPosition } = useWindowScroll({
        behavior: 'smooth',
    });
    const { top: elementVerticalPosition } = useElementBounding(el);

    if (binding.modifiers.visible) {
        // scroll to visible app area
        //TODO!!
    } else {
        windowVerticalPosition.value =
            windowVerticalPosition.value + elementVerticalPosition.value;
    }
}
