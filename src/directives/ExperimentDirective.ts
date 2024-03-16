import type { DirectiveBinding } from 'vue';

export function ExperimentDirective(
    el: HTMLElement,
    binding: DirectiveBinding<any>,
) {
    // this will be called for both `mounted` and `updated`
    if (binding.value) {
        el.classList.add('is-experimental');
        el.title = 'EXPERIMENTAL - use with caution';
    } else {
        // NOTE: This does not remove the element from the DOM/VDOM,
        // it will actually run the full vue lifecycle.
        // If it should not be rendered, additionally use the v-if directive
        // NOTE: using el.remove(); would not help here, since the element
        // would already have been added to the DOM
        el.style.display = 'none';
    }
}
