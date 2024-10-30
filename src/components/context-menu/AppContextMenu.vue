<template>
    <DropdownMenu
        :icon-path="mdiMenu"
        :render-closed="true"
        title="Application context menu"
        left
        down
        data-cy="context-menu-app"
    >
        <div id="appContextMenuTop"></div>
        <!-- The compilation-related views are only available when any is loaded -->
        <div class="dropdown-item is-hidden-mobile">
            <p class="menu-label">View</p>
        </div>
        <div v-if="experimentalRehearse" v-experiment="experimentalRehearse">
            <DropdownMenuRouterLink
                to="/rehearse"
                title="Rehearse"
                :icon-path="mdiPencil"
            />
        </div>
        <DropdownMenuRouterLink
            to="/edit"
            title="Edit"
            :keys="['f2']"
            :icon-path="mdiPencil"
        />
        <template v-if="hasCompilation">
            <DropdownMenuRouterLink
                to="/play"
                title="Play"
                :keys="['f3']"
                :icon-path="mdiPlay"
            />
            <div
                v-if="experimentalMultitrack"
                v-experiment="experimentalMultitrack"
            >
                <DropdownMenuRouterLink
                    to="/mix"
                    title="Mix"
                    :keys="['f6']"
                    :icon-path="mdiTuneVertical"
                />
            </div>
            <DropdownMenuRouterLink
                to="/setlist"
                title="Set list"
                :keys="['f4']"
                :icon-path="mdiListBoxOutline"
            />
            <hr class="dropdown-divider" />
            <div class="dropdown-item is-hidden-mobile">
                <p class="menu-label">Compilation</p>
            </div>
            <div id="appContextMenuCompilation"></div>
            <hr class="dropdown-divider" />
        </template>

        <div class="dropdown-item is-hidden-mobile">
            <p class="menu-label">Application</p>
        </div>

        <DropdownMenuRouterLink
            v-once
            to="/settings"
            title="Settings"
            :icon-path="mdiCogOutline"
        />

        <DropdownMenuRouterLink
            to="/about"
            title="About"
            :keys="['f1']"
            :icon-path="mdiInformationOutline"
        />
        <div id="appContextMenuBottom"></div>
    </DropdownMenu>
</template>

<script setup lang="ts">
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import DropdownMenuRouterLink from '@/components/dropdown-menu/DropdownMenuRouterLink.vue';
import {
    mdiMenu,
    mdiPlay,
    mdiPencil,
    mdiListBoxOutline,
    mdiCogOutline,
    mdiInformationOutline,
    mdiTuneVertical,
} from '@mdi/js';
import { storeToRefs } from 'pinia';
import { useSettingsStore } from '@/store/settings';

/** A nav bar as header with a menu for a compilation
 */
defineProps({
    /** Whether a compilation is currently loaded */
    hasCompilation: {
        type: Boolean,
        required: true,
    },
});

const settings = useSettingsStore();
const { experimentalMultitrack, experimentalRehearse } = storeToRefs(settings);
</script>
