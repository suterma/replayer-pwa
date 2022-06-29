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
        <!-- //TODO above add v-focus-outside feature -->
        <!-- dropdown-trigger -->
        <NavButton
            aria-haspopup="true"
            aria-controls="dropdown-menu"
            :title="title"
            :iconName="iconName"
            @click="toggleDropdownExpanded()"
        />
        <div
            class="dropdown-menu is-unselectable"
            id="dropdown-menu"
            role="menu"
            @click="collapseDropdown()"
        >
            <div class="dropdown-content">
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
import NavButton from '@/components/NavButton.vue';

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
        iconName: {
            type: String,
            default: 'menu-down-outline',
        },
    },
    data() {
        return {
            /** Whether the dropdown menu is shown as expanded.
             */
            isDropdownExpanded: false,
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
<style lang="scss" scoped></style>
