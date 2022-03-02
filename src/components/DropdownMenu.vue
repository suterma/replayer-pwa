<template>
    <div
        :class="{
            dropdown: true,
            'is-right': true,
            'is-hoverable': false,
            'is-active': isDropdownExpanded,
        }"
        @click="toggleDropdownExpanded()"
        v-click-outside="collapseDropdown"
        @blur="collapseDropdown()"
    >
        <!-- dropdown-trigger -->
        <NavButton
            aria-haspopup="true"
            aria-controls="dropdown-menu"
            :title="this.title"
            iconName="menu"
        />
        <div
            class="dropdown-menu is-unselectable"
            id="dropdown-menu"
            role="menu"
        >
            <div class="dropdown-content">
                <!-- HINT: Because of 'is-static', this should not be clickable, but unfortunately I was not able to prevent this yet -->
                <div class="dropdown-item is-static">
                    <p>{{ this.title }}</p>
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
