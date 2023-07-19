<template>
    <ModalDialog>
        <template #title>{{ header }}</template>
        <template #body>
            {{ question }}
        </template>
    </ModalDialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import ModalDialog from '@/components/dialogs/ModalDialog.vue';

export default defineComponent({
    name: 'ConfirmDialog',
    components: { ModalDialog },
    props: {
        question: String,
        header: String,
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
