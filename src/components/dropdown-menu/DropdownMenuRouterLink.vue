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
        >
        </DropdownMenuItem>
    </router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DropdownMenuItem from '@/components/dropdown-menu/DropdownMenuItem.vue';
/** An item for a Dropdown menu
 */
export default defineComponent({
    name: 'DropdownMenuRouterLink',
    components: { DropdownMenuItem },
    props: {
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

        to: {
            type: String,
            required: true,
        },
    },
});
</script>
