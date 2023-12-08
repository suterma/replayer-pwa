<template>
    <button
        class="dropdown-item"
        :disabled="disabled"
        data-cy="dropdown-menu-item"
    >
        <MenuItemContent
            :title="title"
            :subTitle="subTitle"
            :iconPath="iconPath"
            :disabled="disabled">

            <template v-slot:shortcut>{{ shortcut }}</template>
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
