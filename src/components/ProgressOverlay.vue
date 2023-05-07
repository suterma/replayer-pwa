<template>
    <div :class="{ modal: true, 'is-active': hasProgressMessage }">
        <div class="modal-background"></div>
        <div class="modal-content">
            <progress class="progress" max="100"></progress>

            <div class="has-text-centered">
                {{ progressMessage }}
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { useAppStore } from '@/store/app';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';
/** A simple overlay display of the latest application progress message, if any */
export default defineComponent({
    name: 'ProgressOverlay',
    computed: {
        ...mapState(useAppStore, ['progressMessage', 'hasProgressMessage']),
    },
});
</script>
