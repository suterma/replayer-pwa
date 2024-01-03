<template>
    <NavButton :title="title" :icon-path="mdiClose" @click="close()"
        ><slot></slot
    ></NavButton>
</template>

<script setup lang="ts">
import NavButton from '@/components/buttons/NavButton.vue';
import { mdiClose } from '@mdi/js';

/** A button to display and toggle a closed or open expanded state, using a cross icon.
 * @remarks The default state is open.
 */
defineProps({
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
});
const emit = defineEmits(['update:modelValue']);

function close() {
    emit('update:modelValue', true);
}
</script>
