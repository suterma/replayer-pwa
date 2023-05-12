<template>
    <NavButton title="close" :iconPath="mdiClose" @click="close()"
        ><slot></slot
    ></NavButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NavButton from '@/components/buttons/NavButton.vue';
import { mdiClose } from '@mdi/js';

/** A button to display and toggle a collapsed or expanded state, using a directed chevron icon.
 * @remarks The default (expanded) chevron direction is down.
 */
export default defineComponent({
    name: 'CloseButton',
    emits: ['close'],
    components: { NavButton },
    props: {
        /** Whether this represents the closed state. */
        modelValue: {
            type: Boolean,
            default: false,
        },

        /* The title*/
        title: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            /** Icons from @mdi/js */
            mdiClose: mdiClose,
        };
    },

    methods: {
        close() {
            this.$emit('close');
        },
    },
});
</script>
