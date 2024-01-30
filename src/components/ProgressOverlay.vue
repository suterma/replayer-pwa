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
<script setup lang="ts">
/** A simple overlay display of the latest application progress message, if any */
import { useMessageStore } from '@/store/messages';
import { storeToRefs } from 'pinia';
const message = useMessageStore();
const { progressMessage, hasProgressMessage } = storeToRefs(message);
</script>
