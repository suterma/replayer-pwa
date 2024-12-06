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
    useElementBounding,
    useElementVisibility,
    useWindowScroll,
    type MaybeComputedElementRef,
} from '@vueuse/core';
import useLog from '@/composables/LogComposable';

const { log } = useLog();

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
