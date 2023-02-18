<template>
    <Teleport to="#appContextMenuBottom">
        <hr v-once class="dropdown-divider" />
        <Hotkey
            v-once
            :keys="['ctrl', 's']"
            :excluded-elements="[]"
            v-slot="{ clickRef }"
        >
            <DropdownMenuItem
                title="Download... [CTRL+S]"
                subTitle="Save current compilation"
                @click="download"
                :ref="clickRef"
                :iconPath="mdiTrayArrowDown"
            />
        </Hotkey>
        <Hotkey
            v-once
            :keys="['ctrl', 'x']"
            :excluded-elements="[]"
            v-slot="{ clickRef }"
        >
            <DropdownMenuItem
                title="Discard... [CTRL+X]"
                subTitle="Discard current compilation"
                @click="close"
                :ref="clickRef"
                :iconPath="mdiTrashCanOutline"
            />
        </Hotkey>
    </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ActionTypes } from '@/store/action-types';
import { Compilation } from '@/store/compilation-types';
import DropdownMenuItem from '@/components/dropdown-menu/DropdownMenuItem.vue';
import { confirm, downloadCompilation } from '@/code/ui/dialogs';
import { Hotkey } from '@simolation/vue-hotkey';
import { mdiTrashCanOutline, mdiTrayArrowDown } from '@mdi/js';
/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'CompilationContextMenu',
    components: { DropdownMenuItem, Hotkey },
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
                'Discarding compilation',
                `Do you want to discard (and loose any changes to) compilation '${this.compilation.Title}'? Hint: to keep changes for later use, download a copy first.`,
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
