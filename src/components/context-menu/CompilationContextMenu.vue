<template>
    <Teleport to="#appContextMenuCompilation">
        <Hotkey
            v-once
            v-slot="{ clickRef }"
            :keys="['ctrl', 's']"
            :excluded-elements="[]"
        >
            <DropdownMenuButton
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
            <DropdownMenuButton
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

<script setup lang="ts">
import { type PropType } from 'vue';
import DropdownMenuButton from '@/components/dropdown-menu/DropdownMenuButton.vue';
import { confirm, downloadCompilation } from '@/code/ui/dialogs';
import { Hotkey } from '@simolation/vue-hotkey';
import { mdiTrashCanOutline, mdiTrayArrowDown } from '@mdi/js';
import { useAppStore } from '@/store/app';
import type { ICompilation } from '@/store/ICompilation';
import useLog from '@/composables/LogComposable';

const { log } = useLog();

/** A nav bar as header with a menu for a compilation
 */
const props = defineProps({
    compilation: {
        type: Object as PropType<ICompilation>,
        required: true,
    },
});

const app = useAppStore();

/** Closes the compilation
 */
function close(): void {
    confirm(
        'Closing compilation',
        `Do you want to close (and loose any changes to) compilation '${props.compilation.Title}'? Hint: to keep changes for later use, download a copy first.`,
    ).then((ok) => {
        if (ok) {
            app.discardCompilation();
        }
    });
}

function download() {
    downloadCompilation(props.compilation).then((ok) => {
        if (ok) {
            log.debug(`CompilationContextMenu::download initiated`);
        }
    });
}
</script>
