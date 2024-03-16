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
        'has-tooltip-left',
        'has-tooltip-arrow',
        'has-tooltip-multiline',
        'has-tooltip-text-centered',
        'has-tooltip-fade',
    );
    el.setAttribute('data-tooltip', binding.value);
}
