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

    // Handle the active/inactive state
    const isActive = binding.arg as unknown as boolean | null;
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
    el.setAttribute('data-tooltip', binding.value);
}
