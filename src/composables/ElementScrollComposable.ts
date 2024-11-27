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

    const targetIsVisible = useElementVisibility(target);

    /** Scrolls to the target element */
    function scroll() {
        if (!onlyInvisible || !targetIsVisible) {
            console.log('taget', target);

            const { y: windowVerticalPosition } = useWindowScroll({
                behavior: 'smooth',
            });
            //const currentWindowVerticalPositionValue = windowVerticalPosition.value;
            //console.log("currentWindowVerticalPositionValue: ", currentWindowVerticalPositionValue);

            const { top: elementVerticalPosition } = useElementBounding(target);
            //const currentElementVerticalPositionValue = elementVerticalPosition.value;
            //console.log("currentElementVerticalPositionValue: ", currentElementVerticalPositionValue);

            const targetVerticalPosition =
                windowVerticalPosition.value + elementVerticalPosition.value;

            //console.log("targetVerticalPosition: ", targetVerticalPosition);

            windowVerticalPosition.value = targetVerticalPosition;
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
