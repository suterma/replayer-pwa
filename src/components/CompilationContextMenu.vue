<template>
    <DropdownMenu title="Compilation context menu">
        <DropdownMenuItem
            title="Prevent screen timeout"
            subTitle="(while this compilation is open)"
            :class="{
                'is-active': isPreventingScreenTimeoutNow,
            }"
            @click="togglePreventScreenTimeoutNow"
            iconName="television-ambient-light"
        />
        <Hotkey :keys="['ctrl', 's']" v-slot="{ clickRef }">
            <DropdownMenuItem
                title="Download... [CTRL+S]"
                subTitle="Save compilation to the device"
                @click="download"
                :ref="clickRef"
                iconName="tray-arrow-down"
            />
        </Hotkey>
        <hr class="dropdown-divider" />

        <DropdownMenuItem
            title="Close"
            subTitle="(discard the compilation)"
            @click="close"
            iconName="close-box-outline"
        />
    </DropdownMenu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NoSleep from 'nosleep.js';
import { ActionTypes } from '@/store/action-types';
import { Compilation } from '@/store/compilation-types';
import DropdownMenu from '@/components/DropdownMenu.vue';
import DropdownMenuItem from '@/components/DropdownMenuItem.vue';
import { confirm, downloadCompilation } from '@/code/ui/dialogs';
import { Hotkey } from '@simolation/vue-hotkey';

/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'CompilationContextMenu',
    components: { DropdownMenu, DropdownMenuItem, Hotkey },
    props: {
        compilation: {
            type: Compilation,
            required: true,
        },
    },
    data() {
        return {
            /** The wake lock fill-in that can prevent screen timeout, while a compilation is in use */
            noSleep: new NoSleep(),
        };
    },
    methods: {
        /** Closes the compilation
         */
        close(): void {
            confirm(
                'Closing compilation',
                `Do you want to close (and discard any changes to) compilation '${this.compilation.Title}'? Hint: to keep changes for later use, download a copy first.`,
            ).then((ok) => {
                if (ok) {
                    this.$store.dispatch(ActionTypes.DISCARD_COMPILATION);
                }
            });
        },
        download() {
            downloadCompilation(this.compilation).then((ok) => {
                if (ok) {
                    console.debug(`CompilationContextMenu::download done`);
                }
            });
        },
        togglePreventScreenTimeoutNow() {
            if (this.isPreventingScreenTimeoutNow) {
                this.noSleep.disable();
            } else {
                this.noSleep.enable();
            }
        },
    },
    unmounted() {
        this.noSleep.disable();
    },
    computed: {
        isPreventingScreenTimeoutNow(): boolean {
            return this.noSleep.isEnabled;
        },
    },
});
</script>
