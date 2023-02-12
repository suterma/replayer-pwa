<template>
    <!-- 
    //TODO unfortunately the ESC hotkey does interfere with possibly some other instance
    //for the ESC hotkey, most probably in the media handlers, possibly also on the dialogs. 
    -->
    <Hotkey
        :enabled="false"
        :keys="['']"
        :excluded-elements="[]"
        @hotkey="collapseDropdown"
    >
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
            <!-- z-index must be larger than for h1 (but less then the fixed footer) -->
            <NavButton
                style="z-index: 1"
                aria-haspopup="true"
                aria-controls="dropdown-menu"
                :title="title"
                :iconPath="iconPath"
                @click="toggleDropdownExpanded()"
            />

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
        </div>
    </Hotkey>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NavButton from '@/components/buttons/NavButton.vue';
import { mdiDotsVertical } from '@mdi/js';
import { Hotkey } from '@simolation/vue-hotkey';

/** A drop down menu, with a slot for the menu items.
 */
export default defineComponent({
    name: 'DropdownMenu',
    components: { NavButton, Hotkey },
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
