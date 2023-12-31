<template>

<Hotkey v-slot="{ clickRef }" :keys="keys" :excluded-elements="[]" :disabled="disabled || !keys">
    <router-link v-slot="{ navigate }" :to="to" custom>
        <DropdownMenuItem
            :ref='clickRef'
            role="link"
            :title="title"
            :sub-title="subTitle"
            :icon-path="iconPath"
            :disabled="isActiveRoute"
            :shortcut='keys.join("+")'
            @click="navigate"
            @keypress.enter="navigate"
        >
        </DropdownMenuItem>
    </router-link>
</Hotkey>

</template>

<script setup lang="ts">
import {  computed } from 'vue';
import DropdownMenuItem from '@/components/dropdown-menu/DropdownMenuItem.vue';
import { useRoute } from 'vue-router';
import { Hotkey } from '@simolation/vue-hotkey';

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
</script>
