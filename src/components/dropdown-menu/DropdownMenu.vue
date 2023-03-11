<template>
    <div
        class="dropdown is-right"
        :class="{
            'is-active': isDropdownExpanded,
        }"
    >
        <DismissiblePanel
            @dismissed="collapseDropdown"
            :dismissible="isDropdownExpanded"
        >
            <!-- dropdown-trigger -->
            <div class="dropdown-trigger">
                <!-- z-index must be larger than for h1 (but less then the fixed footer) -->
                <NavButton
                    style="z-index: 1"
                    aria-haspopup="true"
                    aria-controls="dropdown-menu"
                    :title="title"
                    :iconPath="iconPath"
                    @click="toggleDropdownExpanded()"
                    data-cy="dropdown-menu-trigger"
                />
            </div>
            <!-- z-index must be larger than the fixed footer -->
            <div
                style="z-index: 3"
                class="dropdown-menu is-unselectable"
                id="dropdown-menu"
                role="menu"
                @click="collapseDropdown()"
            >
                <div class="dropdown-content" ref="target">
                    <!-- HINT: Because of 'is-static', this should not be clickable, but unfortunately I was not able to prevent this yet -->
                    <div
                        class="dropdown-item is-static is-header has-opacity-half"
                    >
                        <p>{{ title }}</p>
                    </div>
                    <hr class="dropdown-divider" />

                    <slot>
                        <!-- The menu items -->
                    </slot>
                </div>
            </div>
        </DismissiblePanel>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NavButton from '@/components/buttons/NavButton.vue';
import DismissiblePanel from '@/components/DismissiblePanel.vue';
import { mdiDotsVertical } from '@mdi/js';

/** A drop down menu, with a slot for the menu items.
 */
export default defineComponent({
    name: 'DropdownMenu',
    components: { NavButton, DismissiblePanel },
    props: {
        /* The menu title*/
        title: {
            type: String,
            default: undefined,
        },
        iconPath: {
            type: String,
            default: mdiDotsVertical,
        },
    },

    data() {
        return {
            /** Whether the dropdown menu is shown as expanded.
             */
            isDropdownExpanded: false,

            /** Icons from @mdi/js */
            mdiDotsVertical: mdiDotsVertical,
        };
    },
    methods: {
        toggleDropdownExpanded() {
            console.debug('DropdownMenu::toggleDropdownExpanded');

            this.isDropdownExpanded = !this.isDropdownExpanded;
        },
        collapseDropdown() {
            console.debug('DropdownMenu::collapseDropdown');
            this.isDropdownExpanded = false;
        },
        expandDropdown() {
            console.debug('DropdownMenu::expandDropdown');

            this.isDropdownExpanded = true;
        },
    },
});
</script>
