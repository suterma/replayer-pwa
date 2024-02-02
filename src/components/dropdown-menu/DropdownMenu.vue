<template>
    <div
        class="dropdown"
        :class="{
            'is-active': isDropdownExpanded,
            'is-up': isMenuTooLow,
            'is-left': !isMenuTooRight,
            'is-right': isMenuTooRight,
        }"
    >
        <DismissiblePanel
            :dismissible="isDropdownExpanded"
            :hotkey="isDropdownExpanded"
            @dismissed="collapseDropdown"
        >
            <!-- dropdown-trigger -->
            <div class="dropdown-trigger">
                <!-- z-index must be larger than for h1 (but less then the fixed footer) -->
                <NavButton
                    style="z-index: 1"
                    aria-haspopup="true"
                    aria-controls="dropdown-menu"
                    :title="title"
                    :icon-path="iconPath"
                    data-cy="dropdown-menu-trigger"
                    @click="toggleDropdownExpanded()"
                />
            </div>
            <!-- z-index must be larger than the fixed footer -->
            <div
                v-if="isDropdownExpanded || renderClosed"
                id="dropdown-menu"
                style="z-index: 3"
                class="dropdown-menu is-unselectable"
                role="menu"
                @click="collapseDropdown()"
            >
                <div ref="target" class="dropdown-content">
                    <slot>
                        <!-- The menu items -->
                    </slot>
                </div>
            </div>
        </DismissiblePanel>
    </div>
</template>

<script setup lang="ts">
import NavButton from '@/components/buttons/NavButton.vue';
import DismissiblePanel from '@/components/DismissiblePanel.vue';
import { mdiDotsVertical } from '@mdi/js';
import { refThrottled, useElementBounding, useWindowSize } from '@vueuse/core';
import { computed, ref } from 'vue';

/** A drop down menu, with a slot for the menu items.
 */
defineProps({
    /* The menu title*/
    title: {
        type: String,
        default: undefined,
    },
    iconPath: {
        type: String,
        default: mdiDotsVertical,
    },
    /** Whether to render the closed menu
     * @remarks Set to true to handle shortcuts or other features on the closed menu / menu entries
     */
    renderClosed: {
        type: Boolean,
        default: false,
    },
});

/** Whether the dropdown menu is shown as expanded.
 */
const isDropdownExpanded = ref(false);

function toggleDropdownExpanded() {
    isDropdownExpanded.value = !isDropdownExpanded.value;
}
function collapseDropdown() {
    isDropdownExpanded.value = false;
}

const target = ref();
const { bottom, right } = useElementBounding(target);
const { height, width } = useWindowSize();

/** Checks the position for the menu
 * @remark Debounced to prevent excess updates
 */
const isMenuTooLow = refThrottled(
    computed(() => {
        return (
            bottom.value >
            height.value - 40 /* avoid menu very close to border or scrollbar */
        );
    }),
    300 /*replayer-transition-duration*/,
);

/** Checks the position for the menu
 * @remark Debounced to prevent excess updates
 */
const isMenuTooRight = refThrottled(
    computed(() => {
        return (
            right.value >
            width.value - 40 /* avoid menu very close to border or scrollbar */
        );
    }),
    300 /*replayer-transition-duration*/,
);
</script>
