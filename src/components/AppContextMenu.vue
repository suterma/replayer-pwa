<template>
    <DropdownMenu
        ref="dropdownMenu"
        title="App context menu"
        style="z-index: 3"
    >
        <Hotkey :keys="['ctrl', 'p']" v-slot="{ clickRef }">
            <router-link
                to="/play"
                title="Switch to play view [CTRL+P]"
                :ref="clickRef"
            >
                <DropdownMenuItem title="Play"></DropdownMenuItem>
            </router-link>
        </Hotkey>
        <Hotkey :keys="['ctrl', 'e']" v-slot="{ clickRef }">
            <router-link
                to="/edit"
                title="Switch to edit view [CTRL+E]"
                :ref="clickRef"
            >
                <DropdownMenuItem title="Edit"> </DropdownMenuItem></router-link
        ></Hotkey>
        <router-link to="/settings" title="Switch to settings view">
            <DropdownMenuItem title="Settings"></DropdownMenuItem>
        </router-link>
        <router-link to="/about" title="Switch to about view">
            <DropdownMenuItem title="About"> </DropdownMenuItem
        ></router-link>

        <Experimental>
            <router-link to="/development" title="Switch to development view">
                <DropdownMenuItem title="Development"> </DropdownMenuItem
            ></router-link>
        </Experimental>
    </DropdownMenu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DropdownMenu from '@/components/DropdownMenu.vue';
import DropdownMenuItem from '@/components/DropdownMenuItem.vue';
import Experimental from '@/components/Experimental.vue';
import { Hotkey } from '@simolation/vue-hotkey';

/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'CompilationHeader',
    components: { DropdownMenu, DropdownMenuItem, Experimental, Hotkey },
    methods: {},
});
</script>
