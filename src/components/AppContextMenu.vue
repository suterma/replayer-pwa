<template>
    <DropdownMenu title="App context menu">
        <router-link to="/play" title="Switch to play view">
            <DropdownMenuItem title="Play"></DropdownMenuItem>
        </router-link>
        <router-link to="/edit" title="Switch to edit view">
            <DropdownMenuItem title="Edit"> </DropdownMenuItem
        ></router-link>
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

/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'CompilationHeader',
    components: { DropdownMenu, DropdownMenuItem, Experimental },
});
</script>
