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
    type MaybeComputedElementRef,
} from '@vueuse/core';
import { ref } from 'vue';

export interface UseScrollElementOptions {
    /**
     * Immediately call update on component mounted
     *
     * @default true
     */
    immediate?: boolean;
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
    const { immediate = true } = options;

    const bottom = ref(0);
    const top = ref(0);

    function scroll() {
        const el = unrefElement(target);

        if (!el) {
            bottom.value = 0;
            top.value = 0;
            return;
        }

        const rect = el.getBoundingClientRect();
        bottom.value = rect.bottom;
        top.value = rect.top;
    }

    tryOnMounted(() => {
        if (immediate) scroll();
    });

    return {
        bottom,

        top,

        scroll,
    };
}

export type UseElementScrollReturn = ReturnType<typeof useElementScroll>;
