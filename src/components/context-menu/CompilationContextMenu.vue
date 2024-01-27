<template>
    <Teleport to="#appContextMenuCompilation">
        <Hotkey
            v-once
            v-slot="{ clickRef }"
            :keys="['ctrl', 's']"
            :excluded-elements="[]"
        >
            <DropdownMenuItem
                :ref="clickRef"
                title="Download..."
                sub-title="Save current compilation"
                :icon-path="mdiTrayArrowDown"
                shortcut="CTRL+S"
                @click="download"
            />
        </Hotkey>
        <Hotkey
            v-once
            v-slot="{ clickRef }"
            :keys="['ctrl', 'x']"
            :excluded-elements="[]"
        >
            <DropdownMenuItem
                :ref="clickRef"
                title="Close..."
                sub-title="Close current compilation"
                :icon-path="mdiTrashCanOutline"
                shortcut="CTRL+X"
                @click="close"
            />
        </Hotkey>
    </Teleport>
</template>

<script lang="ts">
import { type PropType, defineComponent } from 'vue';
import DropdownMenuItem from '@/components/dropdown-menu/DropdownMenuItem.vue';
import { confirm, downloadCompilation } from '@/code/ui/dialogs';
import { Hotkey } from '@simolation/vue-hotkey';
import { mdiTrashCanOutline, mdiTrayArrowDown } from '@mdi/js';
import { mapActions } from 'pinia';
import { useAppStore } from '@/store/app';
import type { ICompilation } from '@/store/ICompilation';
/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'CompilationContextMenu',
    components: { DropdownMenuItem, Hotkey },
    props: {
        compilation: {
            type: Object as PropType<ICompilation>,
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
        ...mapActions(useAppStore, ['discardCompilation']),

        /** Closes the compilation
         */
        close(): void {
            confirm(
                'Closing compilation',
                `Do you want to close (and loose any changes to) compilation '${this.compilation.Title}'? Hint: to keep changes for later use, download a copy first.`,
            ).then((ok) => {
                if (ok) {
                    this.discardCompilation();
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
