<template>
    <DropdownMenu v-once title="Compilation context menu">
        <Hotkey :keys="['ctrl', 's']" v-slot="{ clickRef }">
            <DropdownMenuButton
                title="Download... [CTRL+S]"
                subTitle="Save compilation to the device"
                @click="download"
                :ref="clickRef"
                :iconPath="mdiTrayArrowDown"
            />
        </Hotkey>
        <hr class="dropdown-divider" />
        <Hotkey :keys="['ctrl', 'x']" v-slot="{ clickRef }">
            <DropdownMenuButton
                title="Close [CTRL+X]"
                subTitle="(discard the compilation)"
                @click="close"
                :ref="clickRef"
                :iconPath="mdiCloseBoxOutline"
            />
        </Hotkey>
    </DropdownMenu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ActionTypes } from '@/store/action-types';
import { Compilation } from '@/store/compilation-types';
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import DropdownMenuButton from '@/components/dropdown-menu/DropdownMenuButton.vue';
import { confirm, downloadCompilation } from '@/code/ui/dialogs';
import { Hotkey } from '@simolation/vue-hotkey';
import { mdiCloseBoxOutline, mdiTrayArrowDown } from '@mdi/js';
/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'CompilationContextMenu',
    components: { DropdownMenu, DropdownMenuButton, Hotkey },
    props: {
        compilation: {
            type: Compilation,
            required: true,
        },
    },
    data() {
        return {
            /** Icons from @mdi/js */
            mdiCloseBoxOutline: mdiCloseBoxOutline,
            mdiTrayArrowDown: mdiTrayArrowDown,
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
    },
});
</script>
