<template>
    <div
        class="dropdown"
        :class="{
            'is-active': isDropdownExpanded,
            'is-up': isMenuForcedUp,
            'is-down': !isMenuForcedUp,
            'is-left': !isMenuForcedLeft,
            'is-right': isMenuForcedLeft,
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
                    ref="button"
                    style="z-index: 1"
                    aria-haspopup="true"
                    aria-controls="dropdown-menu"
                    :title="title"
                    :icon-path="iconPath"
                    data-cy="dropdown-menu-trigger"
                    @click="toggleDropdownExpanded()"
                />
            </div>
            <!-- Transition for the revealing action. 
                Uses an additional element to make sure that there is a single root within the transition slot -->
            <Transition
                :name="isMenuForcedUp ? 'item-expand-up' : 'item-expand'"
            >
                <!-- z-index must be larger than the fixed footer -->
                <div
                    v-if="isDropdownExpanded || renderClosed"
                    v-show="isDropdownExpanded"
                    id="dropdown-menu"
                    ref="menu"
                    style="z-index: 4"
                    class="dropdown-menu is-unselectable transition-in-place"
                    role="menu"
                    @click="collapseDropdown()"
                >
                    <div class="dropdown-content">
                        <slot>
                            <!-- The menu items -->
                        </slot>
                    </div>
                </div>
            </Transition>
        </DismissiblePanel>
    </div>
</template>

<script setup lang="ts">
import NavButton from '@/components/buttons/NavButton.vue';
import DismissiblePanel from '@/components/DismissiblePanel.vue';
import { mdiDotsVertical, mdiPrinterPosPause } from '@mdi/js';
import { refThrottled, useElementBounding, useWindowSize } from '@vueuse/core';
import { computed, ref } from 'vue';

/** A drop down menu, with a slot for the menu items.
 */
const props = defineProps({
    /* The menu title*/
    title: {
        type: String,
        default: undefined,
    },
    iconPath: {
        type: String,
        default: mdiDotsVertical,
    },

    /** Whether to render the menu as left-opening
     * @remarks Without direction, the menu opens according to the available space
     */
    left: {
        type: Boolean,
        default: false,
    },

    /** Whether to render the menu as right-opening
     * @remarks Without direction, the menu opens according to the available space
     */
    right: {
        type: Boolean,
        default: false,
    },
    /** Whether to render the menu as up-opening
     * @remarks Without direction, the menu opens according to the available space
     */
    up: {
        type: Boolean,
        default: false,
    },
    /** Whether to render the menu as down-opening
     * @remarks Without direction, the menu opens according to the available space
     */
    down: {
        type: Boolean,
        default: false,
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

const button = ref();
const { bottom, right, top, left } = useElementBounding(button);
const menu = ref();
//const { bottom, right, top, left } = useElementBounding(menu);
const { height, width } = useWindowSize();

/** Checks the position for the menu
 * @remark Debounced to prevent excess updates
 */
const isMenuForcedUp = refThrottled(
    computed(() => {
        // When no direction required, just use the one with the most space
        if (!props.up && !props.down) {
            const spaceAboveMenuButton = top.value;
            const spaceBelowMenuButton = height.value - bottom.value;

            return spaceAboveMenuButton > spaceBelowMenuButton;
        }

        return props.up && !props.down;
    }),
    300 /*replayer-transition-duration*/,
);

/** Checks the position for the menu
 * @remark Debounced to prevent excess updates
 */
const isMenuForcedLeft = refThrottled(
    computed(() => {
        // When no direction required, just use the one with the most space
        if (!props.left && !props.right) {
            const spaceLeftOfMenuButton = left.value;
            const spaceRightOfMenuButton = width.value - right.value;

            return spaceLeftOfMenuButton > spaceRightOfMenuButton;
        }

        return props.left && !props.right;
    }),
    300 /*replayer-transition-duration*/,
);
</script>
