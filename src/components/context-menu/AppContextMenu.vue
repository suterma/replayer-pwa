<template>
    <DropdownMenu
        v-once
        ref="dropdownMenu"
        title="App menu"
        :iconPath="mdiMenu"
        style="z-index: 3"
    >
        <div id="appContextMenuTop"></div>
        <Hotkey :keys="['f5']" :excluded-elements="[]" v-slot="{ clickRef }">
            <DropdownMenuRouterLink
                to="/play"
                title="Play"
                shortcut="F5"
                :clickRef="clickRef"
                :iconPath="mdiPlay"
            />
        </Hotkey>
        <Hotkey :keys="['f2']" :excluded-elements="[]" v-slot="{ clickRef }">
            <DropdownMenuRouterLink
                to="/edit"
                title="Edit"
                shortcut="F2"
                :clickRef="clickRef"
                :iconPath="mdiPencil"
            />
        </Hotkey>
        <DropdownMenuRouterLink
            to="/setlist"
            title="Set list"
            :iconPath="mdiListBoxOutline"
        />
        <DropdownMenuRouterLink
            to="/settings"
            title="Settings"
            :iconPath="mdiCogOutline"
        />
        <Hotkey :keys="['f1']" :excluded-elements="[]" v-slot="{ clickRef }">
            <DropdownMenuRouterLink
                to="/about"
                title="About"
                shortcut="F1"
                :clickRef="clickRef"
                :iconPath="mdiInformationOutline"
            />
        </Hotkey>
        <Experimental>
            <DropdownMenuRouterLink
                to="/development"
                title="Development"
                :iconPath="mdiFlaskOutline"
            />
        </Experimental>
    </DropdownMenu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import DropdownMenuRouterLink from '@/components/dropdown-menu/DropdownMenuRouterLink.vue';
import { Hotkey } from '@simolation/vue-hotkey';
import {
    mdiMenu,
    mdiPlay,
    mdiPencil,
    mdiListBoxOutline,
    mdiCogOutline,
    mdiInformationOutline,
    mdiFlaskOutline,
} from '@mdi/js';

/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'AppContextMenu',
    components: {
        DropdownMenu,
        DropdownMenuRouterLink,
        Hotkey,
    },
    data() {
        return {
            /** Icons from @mdi/js */
            mdiMenu: mdiMenu,
            mdiPlay: mdiPlay,
            mdiPencil: mdiPencil,
            mdiListBoxOutline: mdiListBoxOutline,
            mdiCogOutline: mdiCogOutline,
            mdiInformationOutline: mdiInformationOutline,
            mdiFlaskOutline: mdiFlaskOutline,
        };
    },
});
</script>
