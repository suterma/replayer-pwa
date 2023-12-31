<template>
    <NavButton :title="title" :icon-path="mdiClose" @click="close()"
        ><slot></slot
    ></NavButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NavButton from '@/components/buttons/NavButton.vue';
import { mdiClose } from '@mdi/js';

/** A button to display and toggle a closed or open expanded state, using a cross icon.
 * @remarks The default state is open.
 */
export default defineComponent({
    name: 'CloseButton',
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
            default: 'Close',
        },
    },
    emits: ['close', 'update:modelValue'],

    data() {
        return {
            /** Icons from @mdi/js */
            mdiClose: mdiClose,
        };
    },

    methods: {
        close() {
            this.$emit('close');
            this.$emit('update:modelValue', true);
        },
    },
});
</script>
