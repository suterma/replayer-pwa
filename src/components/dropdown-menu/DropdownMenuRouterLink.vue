<template>
    <Hotkey
        v-slot="{ clickRef }"
        :keys="keys"
        :excluded-elements="[]"
        :disabled="disabled || keys.length == 0"
    >
        <DropdownMenuButton
            :ref="clickRef"
            role="link"
            :title="title"
            :sub-title="subTitle"
            :icon-path="iconPath"
            :disabled="isActiveRoute"
            :is-active="isActiveRoute"
            :shortcut="keys.join('+')"
            @click="navigate"
            @keypress.enter="navigate"
        >
        </DropdownMenuButton>
    </Hotkey>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DropdownMenuButton from '@/components/dropdown-menu/DropdownMenuButton.vue';
import { useRoute, useRouter } from 'vue-router';
import { Hotkey } from '@simolation/vue-hotkey';
import { useMessageStore } from '@/store/messages';
import { nextTick } from 'process';
import { storeToRefs } from 'pinia';

/** An item for a Dropdown menu
 * @remarks Supports a global hotkey registration
 */
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    /**
     * The hotkey keys, acting as keyboard shortcut.
     *
     * @example
     * ```vue
     * <HotKey keys="['ctrl', 's']" @hotkey="action" />
     * // or
     * <HotKey :keys="['ctrl', 's']" @hotkey="action" />
     * ```
     */
    keys: {
        type: Array<string>,
        required: false,
        default: [],
    },
    subTitle: {
        type: String,
        default: '',
        required: false,
    },
    iconPath: {
        type: String,
        default: '',
        required: false,
    },
    disabled: {
        type: Boolean,
        required: false,
        default: false,
    },
    to: {
        type: String,
        required: true,
    },
});

const route = useRoute();

/** Wheter this item represents the current route
 */
const isActiveRoute = computed(() => {
    return route.path == props.to;
});

// --- deferred routing (with indication) ---

const router = useRouter();
const message = useMessageStore();

const { isBusyRouting } = storeToRefs(message);

function navigate() {
    isBusyRouting.value = true;
    // let the progress indication show up first
    nextTick(() => {
        router.push(props.to);
    });
}

router.afterEach(() => {
    isBusyRouting.value = false;
});
</script>
