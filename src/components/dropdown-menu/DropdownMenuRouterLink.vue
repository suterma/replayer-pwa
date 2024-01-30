<template>
    <Hotkey
        v-slot="{ clickRef }"
        :keys="keys"
        :excluded-elements="[]"
        :disabled="disabled || !keys"
    >
        <DropdownMenuItem
            :ref="clickRef"
            role="link"
            :title="title"
            :sub-title="subTitle"
            :icon-path="iconPath"
            :disabled="isActiveRoute"
            :shortcut="keys.join('+')"
            @click="navigate"
            @keypress.enter="navigate"
        >
        </DropdownMenuItem>
    </Hotkey>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DropdownMenuItem from '@/components/dropdown-menu/DropdownMenuItem.vue';
import { useRoute, useRouter } from 'vue-router';
import { Hotkey } from '@simolation/vue-hotkey';
import { useMessageStore } from '@/store/messages';
import { nextTick } from 'process';

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

function navigate() {
    message.pushProgress('Loading...');
    // let the progress indication show up first
    nextTick(() => {
        router.push(props.to);
    });
}

router.afterEach(() => {
    const message = useMessageStore();
    message.finishProgress();
});
</script>
