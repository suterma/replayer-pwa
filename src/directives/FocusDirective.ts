/** A directive that focuses the component's root element after it has been mounted
 */
export const FocusDirective = {
    // called when the bound element's parent component
    // and all its children are mounted.
    mounted(el: HTMLElement) {
        el.focus();
    },
};
