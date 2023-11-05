<template>
    <DropdownMenu ref="dropdownMenu" :iconPath="mdiMenu">
        <div id="appContextMenuTop"></div>
        <!-- The compilation-related views are only available when any is loaded -->
        <div class="dropdown-item is-hidden-mobile">
            <p class="menu-label">View</p>
        </div>
        <Hotkey
            v-once
            :keys="['f2']"
            :excluded-elements="[]"
            v-slot="{ clickRef }"
        >
            <DropdownMenuRouterLink
                to="/edit"
                title="Edit"
                shortcut="F2"
                :clickRef="clickRef"
                :iconPath="mdiPencil"
                :disabled="true"
            />
        </Hotkey>
        <template v-if="hasCompilation">
            <Hotkey
                v-once
                :keys="['f3']"
                :excluded-elements="[]"
                v-slot="{ clickRef }"
            >
                <DropdownMenuRouterLink
                    to="/play"
                    title="Play"
                    shortcut="F3"
                    :clickRef="clickRef"
                    :iconPath="mdiPlay"
                />
            </Hotkey>
            <Hotkey
                v-if="experimentalMultitrack"
                :keys="['f6']"
                :excluded-elements="[]"
                v-slot="{ clickRef }"
            >
                <div v-experiment="experimentalMultitrack">
                    <DropdownMenuRouterLink
                        to="/mix"
                        title="Mix"
                        shortcut="F6"
                        :clickRef="clickRef"
                        :iconPath="mdiTuneVertical"
                    />
                </div>
            </Hotkey>
            <Hotkey
                v-once
                :keys="['f4']"
                :excluded-elements="[]"
                v-slot="{ clickRef }"
            >
                <DropdownMenuRouterLink
                    v-once
                    to="/setlist"
                    title="Set list"
                    shortcut="F4"
                    :clickRef="clickRef"
                    :iconPath="mdiListBoxOutline"
                />
            </Hotkey>
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
            :iconPath="mdiCogOutline"
        />
        <Hotkey
            v-once
            :keys="['f1']"
            :excluded-elements="[]"
            v-slot="{ clickRef }"
        >
            <DropdownMenuRouterLink
                to="/about"
                title="About"
                shortcut="F1"
                :clickRef="clickRef"
                :iconPath="mdiInformationOutline"
            />
        </Hotkey>
        <div id="appContextMenuBottom"></div>
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
    mdiTuneVertical,
} from '@mdi/js';
import { mapState } from 'pinia';
import { useSettingsStore } from '@/store/settings';

/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'AppContextMenu',
    components: {
        DropdownMenu,
        DropdownMenuRouterLink,
        Hotkey,
    },
    props: {
        /** Whether a compilation is currently loaded */
        hasCompilation: {
            type: Boolean,
            required: true,
        },
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
            mdiTuneVertical: mdiTuneVertical,
        };
    },
    computed: {
        ...mapState(useSettingsStore, ['experimentalMultitrack']),
    },
});
</script>
