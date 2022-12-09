<template>
    <DropdownMenu
        v-once
        ref="dropdownMenu"
        title="App menu"
        iconName="hamburger-menu"
        style="z-index: 3"
    >
        <Hotkey :keys="['f5']" :excluded-elements="[]" v-slot="{ clickRef }">
            <DropdownMenuRouterLink
                to="/play"
                title="Play"
                shortcut="F5"
                :clickRef="clickRef"
                iconName="play"
            />
        </Hotkey>
        <Hotkey :keys="['f2']" :excluded-elements="[]" v-slot="{ clickRef }">
            <DropdownMenuRouterLink
                to="/edit"
                title="Edit"
                shortcut="F2"
                :clickRef="clickRef"
                iconName="pencil"
            />
        </Hotkey>
        <DropdownMenuRouterLink
            to="/setlist"
            title="Set list"
            iconName="list-box-outline"
        />
        <DropdownMenuRouterLink
            to="/settings"
            title="Settings"
            iconName="cog-outline"
        />
        <Hotkey :keys="['f1']" :excluded-elements="[]" v-slot="{ clickRef }">
            <DropdownMenuRouterLink
                to="/about"
                title="About"
                shortcut="F1"
                :clickRef="clickRef"
                iconName="information-outline"
            />
        </Hotkey>
        <Experimental>
            <DropdownMenuRouterLink
                to="/development"
                title="Development"
                iconName="flask-outline"
            />
        </Experimental>
    </DropdownMenu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import DropdownMenuRouterLink from '@/components/dropdown-menu/DropdownMenuRouterLink.vue';
import { Hotkey } from '@simolation/vue-hotkey';

/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'AppContextMenu',
    components: {
        DropdownMenu,
        DropdownMenuRouterLink,

        Hotkey,
    },
});
</script>
