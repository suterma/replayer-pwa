<template>
    <button class="dropdown-item" :disabled="disabled">
        <MenuItemContent
            :title="title"
            :subTitle="subTitle"
            :shortcut="shortcut"
            :iconName="iconName"
            :disabled="disabled"            
        >
        </MenuItemContent>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MenuItemContent from '@/components/MenuItemContent.vue';
/** An item for a Dropdown menu
 */
export default defineComponent({
    name: 'DropdownMenuButton',
    components: { MenuItemContent },
    props: {
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
        iconName: {
            type: String,
            default: '',
            required: false,
        },
    },
});
</script>
