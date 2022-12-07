<template>
    <div
        :class="{
            dropdown: true,
            'is-right': true,
            'is-hoverable': false,
            'is-active': isDropdownExpanded,
        }"
        v-click-outside="collapseDropdown"
    >
        <!-- dropdown-trigger -->
        <NavButton
            aria-haspopup="true"
            aria-controls="dropdown-menu"
            :title="title"
            :iconPath="iconPath"
            @click="toggleDropdownExpanded()"
        />
        <div
            class="dropdown-menu is-unselectable"
            id="dropdown-menu"
            role="menu"
            @click="collapseDropdown()"
        >
            <div class="dropdown-content" ref="target">
                <!-- HINT: Because of 'is-static', this should not be clickable, but unfortunately I was not able to prevent this yet -->
                <div class="dropdown-item is-static is-header has-opacity-half">
                    <p>{{ title }}</p>
                </div>
                <hr class="dropdown-divider" />
                <slot>
                    <!-- The menu items -->
                </slot>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NavButton from '@/components/buttons/NavButton.vue';
import { mdiDotsVertical } from '@mdi/js';

/** A drop down menu, with a slot for the menu items.
 */
export default defineComponent({
    name: 'DropdownMenu',
    components: { NavButton },
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
            this.isDropdownExpanded = !this.isDropdownExpanded;
        },
        collapseDropdown() {
            this.isDropdownExpanded = false;
        },
        expandDropdown() {
            this.isDropdownExpanded = true;
        },
    },
});
</script>
