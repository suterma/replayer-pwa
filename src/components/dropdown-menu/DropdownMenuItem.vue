<template>
    <button
        class="dropdown-item"
        :disabled="disabled"
        data-cy="dropdown-menu-item"
    >
        <MenuItemContent
            :title="title"
            :sub-title="subTitle"
            :icon-path="iconPath"
            :disabled="disabled"
        >
            <template v-if="shortcut" #shortcut>{{ shortcut }}</template>
        </MenuItemContent>
    </button>
</template>

<script setup lang="ts">
import MenuItemContent from '@/components/dropdown-menu/MenuItemContent.vue';
/** An item for a Dropdown menu
 */
defineProps({
    title: {
        type: String,
        required: true,
    },
    shortcut: {
        type: String,
        required: false,
    },
    disabled: {
        type: Boolean,
        required: false,
        default: false,
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
});
</script>
