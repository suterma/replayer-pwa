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

import {
    tryOnMounted,
    unrefElement,
    useElementBounding,
    useElementVisibility,
    useWindowScroll,
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
    const {
        immediate = false,
        onlyInvisible = false } = options;

    const { y: windowVerticalPosition } = useWindowScroll({
        behavior: 'smooth',
    });

    /** Scrolls to the target element */
    function scroll() {

        // due to unknown reasons, nextTick() does
        // not work here, scrolling would not occur.
        // With setTimeout(), scrolling is sucessful
        setTimeout(() => {
            const targetIsVisible = useElementVisibility(target)
            if (!onlyInvisible || !targetIsVisible) {
                const { top: elementVerticalPosition } = useElementBounding(target);
                {
                    windowVerticalPosition.value =
                        windowVerticalPosition.value + elementVerticalPosition.value;
                }
            }
        }, 0);
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
