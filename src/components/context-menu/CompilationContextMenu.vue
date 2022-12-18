<template>
    <Teleport to="#appContextMenuTop">
        <!-- <DropdownMenu v-once title="Compilation menu"> -->
        <Hotkey :keys="['ctrl', 's']" v-slot="{ clickRef }">
            <DropdownMenuButton
                title="Download... [CTRL+S]"
                subTitle="Save current compilation"
                @click="download"
                :ref="clickRef"
                :iconPath="mdiTrayArrowDown"
            />
        </Hotkey>
        <Hotkey :keys="['ctrl', 'x']" v-slot="{ clickRef }">
            <DropdownMenuButton
                title="Discard... [CTRL+X]"
                subTitle="Discard current compilation"
                @click="close"
                :ref="clickRef"
                :iconPath="mdiTrashCanOutline"
            />
        </Hotkey>
        <hr class="dropdown-divider" />
        <!-- </DropdownMenu> -->
    </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ActionTypes } from '@/store/action-types';
import { Compilation } from '@/store/compilation-types';
import DropdownMenuButton from '@/components/dropdown-menu/DropdownMenuButton.vue';
import { confirm, downloadCompilation } from '@/code/ui/dialogs';
import { Hotkey } from '@simolation/vue-hotkey';
import { mdiTrashCanOutline, mdiTrayArrowDown } from '@mdi/js';
/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'CompilationContextMenu',
    components: {  DropdownMenuButton, Hotkey },
    props: {
        compilation: {
            type: Compilation,
            required: true,
        },
    },
    data() {
        return {
            /** Icons from @mdi/js */
            mdiTrashCanOutline: mdiTrashCanOutline,
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
