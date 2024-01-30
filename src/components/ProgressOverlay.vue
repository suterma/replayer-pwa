<template>
    <div :class="{ modal: true, 'is-active': hasProgressMessage }">
        <div class="modal-background"></div>
        <div class="modal-content is-loading">
            <!-- Show the message and a horzontal progress -->
            <template v-if="progressMessage">
                <progress class="progress" max="100">
                    <div class="has-text-centered">
                        {{ progressMessage }}
                    </div>
                </progress>
            </template>
            <!-- Alternatively, just show a spinner -->
            <div v-else class="has-text-centered">
                <div class="button is-loading is-ghost is-large"></div>
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
