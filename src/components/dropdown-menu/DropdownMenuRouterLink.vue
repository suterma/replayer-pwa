<template>
    <router-link :to="to" custom v-slot="{ navigate }">
        <DropdownMenuItem
            @click="navigate"
            @keypress.enter="navigate"
            role="link"
            :ref="clickRef"
            :title="title"
            :subTitle="subTitle"
            :iconPath="iconPath"
            :shortcut="shortcut"
            :disabled="isActiveRoute"
        >
        </DropdownMenuItem>
    </router-link>
</template>

<script setup lang="ts">
import DropdownMenuItem from '@/components/dropdown-menu/DropdownMenuItem.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
/** An item for a Dropdown menu
 */
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    shortcut: {
        type: String,
        required: false,
    },
    /** set a reference to the clickable button for the link*/
    clickRef: {
        type: Object,
        required: false,
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
