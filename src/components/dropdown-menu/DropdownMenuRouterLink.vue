<template>

<Hotkey :keys="keys" :excluded-elements="[]" v-slot="{ clickRef }" :disabled="disabled || !keys">
    <router-link :to="to" custom v-slot="{ navigate }">
        <DropdownMenuItem
            @click="navigate"
            @keypress.enter="navigate"
            role="link"
            :ref='clickRef'
            :title="title"
            :subTitle="subTitle"
            :iconPath="iconPath"
            :disabled="isActiveRoute"
            :shortcut='keys.join("+")'
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
