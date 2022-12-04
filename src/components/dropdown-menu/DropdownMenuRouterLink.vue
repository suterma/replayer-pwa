<template>
    <router-link :to="to" custom v-slot="{ navigate }">
        <DropdownMenuButton
            @click="navigate"
            @keypress.enter="navigate"
            role="link"
            :ref="clickRef"
            :title="title"
            :subTitle="subTitle"
            :iconName="iconName"
            :shortcut="shortcut"
        >
        </DropdownMenuButton>
    </router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DropdownMenuButton from '@/components/dropdown-menu/DropdownMenuButton.vue';
/** An item for a Dropdown menu
 */
export default defineComponent({
    name: 'DropdownMenuRouterLink',
    components: { DropdownMenuButton },
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
        iconName: {
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
