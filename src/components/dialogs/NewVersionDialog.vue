<template>
    <ModalDialog required>
        <template #title>New version: {{ version }}</template>
        <template #body>{{ updateText }}</template>
    </ModalDialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalDialog from '@/components/dialogs/ModalDialog.vue';

export default defineComponent({
    name: 'NewVersionDialog',
    components: { ModalDialog },
    props: {
        version: String,
        updateText: String,
    },

    setup() {
        /** NOTE: Returning the returnValue function is required by vue3-promise-dialog */
        function returnValue() {
            return true;
        }
        return {
            returnValue,
        };
    },
});
</script>
