<template>
    <DropdownMenu
        ref="dropdownMenu"
        title="App menu"
        iconName="hamburger-menu"
        style="z-index: 3"
    >
        <Hotkey :keys="['ctrl', 'p']" v-slot="{ clickRef }">
            <DropdownMenuRouterLink
                to="/play"
                title="Play [CTRL+P]"
                :ref="clickRef"
                iconName="play"
            />
        </Hotkey>
        <Hotkey :keys="['ctrl', 'e']" v-slot="{ clickRef }">
            <DropdownMenuRouterLink
                to="/edit"
                title="Edit [CTRL+E]"
                :ref="clickRef"
                iconName="pencil"
            />
        </Hotkey>
        <Experimental>
            <DropdownMenuRouterLink
                to="/list"
                title="List"
                iconName="list-box-outline"
            />
        </Experimental>
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
        <DropdownMenuRouterLink
            to="/about"
            title="About"
            iconName="information-outline"
        />
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
import Experimental from '@/components/Experimental.vue';
import { Hotkey } from '@simolation/vue-hotkey';

/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'AppContextMenu',
    components: { DropdownMenu, DropdownMenuRouterLink, Experimental, Hotkey },
    methods: {},
});
</script>
