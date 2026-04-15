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
