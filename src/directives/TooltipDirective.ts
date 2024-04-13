/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import type { DirectiveBinding } from 'vue';

/** A directive that adds a formatted tooltip to a
 * component's root element
 * @devdoc This will be called for both `mounted` and `updated`
 */
export function TooltipDirective(
    el: HTMLElement,
    binding: DirectiveBinding<any>,
) {
    el.classList.add(
        'has-tooltip-arrow',
        'has-tooltip-multiline',
        'has-tooltip-text-centered',
        'has-tooltip-fade',
    );

    if (binding.modifiers.top) {
        // none, default with bulma-tooltip
    } else if (binding.modifiers.right) {
        el.classList.add('has-tooltip-right');
    } else if (binding.modifiers.bottom) {
        el.classList.add('has-tooltip-bottom');
    } else {
        //default with Replayer
        el.classList.add('has-tooltip-left');
    }

    if (binding.modifiers.hover) {
        el.classList.add('is-hover-only');
    }

    // Handle the active/inactive state
    const isActive = binding.arg as unknown as boolean | null;
    const value = binding.value;
    if (isActive === true) {
        el.classList.add('has-tooltip-active');
        el.classList.remove('has-tooltip-inactive');
    } else if (isActive === false) {
        el.classList.remove('has-tooltip-active');
        el.classList.add('has-tooltip-inactive');
    } else {
        el.classList.remove('has-tooltip-inactive');
        el.classList.remove('has-tooltip-active');
    }
    if (value) {
        el.setAttribute('data-tooltip', value);
    } else {
        el.removeAttribute('data-tooltip');
    }
}
