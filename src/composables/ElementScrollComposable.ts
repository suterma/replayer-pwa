import {
    tryOnMounted,
    useElementBounding,
    useElementVisibility,
    type MaybeComputedElementRef,
} from '@vueuse/core';

export interface UseScrollElementOptions {
    /**
     * Immediately call update on component mounted
     *
     * @default false
     */
    immediate?: boolean;

    /**
     * Scroll only if the element is not yet visible
     * @default false
     */
    onlyInvisible?: boolean;
}

/**
 * Reactive (vertical) scroller for an HTML element.
 *
 * @param target
 */
export function useElementScroll(
    target: MaybeComputedElementRef,
    options: UseScrollElementOptions = {},
) {
    const { immediate = false, onlyInvisible = false } = options;

    /** Scrolls to the target element */
    function scroll() {
        const targetIsVisible = useElementVisibility(target);
        if (!onlyInvisible || !targetIsVisible) {
            const { top: elementVerticalPosition } = useElementBounding(target);

            window.scrollBy({
                top: elementVerticalPosition.value,
                left: 0,
                behavior: 'smooth',
            });
        }
    }

    tryOnMounted(() => {
        if (immediate) scroll();
    });

    return {
        /** Scrolls to the target element */
        scroll,
    };
}

export type UseElementScrollReturn = ReturnType<typeof useElementScroll>;
