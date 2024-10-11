<template>
    <!-- Display area for messages -->
    <div
        :class="{
            modal: true,
            'is-active': hasErrorMessages || hasSuccessMessages,
        }"
    >
        <div class="modal-background"></div>
        <div class="modal-content">
            <div v-for="errorMessage in errorMessages" :key="errorMessage">
                <div
                    class="notification is-danger"
                    data-cy="notification-danger"
                    @click="dismissError"
                >
                    <button
                        class="delete is-large"
                        aria-label="delete"
                        @click="dismissError"
                    ></button>
                    <div class="block">
                        {{ errorMessage }}
                    </div>
                </div>
            </div>
            <div
                v-for="successMessage in successMessages"
                :key="successMessage"
            >
                <div
                    class="notification is-success"
                    data-cy="notification-success"
                    @click="dismissSuccess"
                >
                    <button
                        class="delete is-large"
                        aria-label="delete"
                        @click="dismissSuccess"
                    ></button>
                    <div class="block">
                        {{ successMessage }}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Unobtrusive display area for keyboard input feedback -->
    <v-snackbar v-model="hasInputFeedback" location="center">
        <code class="text-h3 pa-4">{{ inputFeedback?.Data }}</code>

        <template #actions>
            <span class="text-h3 pa-4">{{
                inputFeedback?.Action
            }}</span></template
        >
    </v-snackbar>

    <!-- display area for progress display -->
    <v-snackbar v-model="hasProgressMessage">
        <v-list disabled density="compact">
            <v-list-item
                v-for="progressMessage in progressMessages"
                :key="progressMessage.Message"
                :value="progressMessage"
                color="primary"
            >
                <template #prepend>
                    <v-progress-circular
                        v-if="progressMessage.Percentage"
                        :model-value="progressMessage.Percentage"
                    ></v-progress-circular>

                    <v-progress-circular
                        v-else
                        indeterminate
                    ></v-progress-circular>
                </template>

                <v-list-item-title
                    v-text="progressMessage.Message"
                ></v-list-item-title>
            </v-list-item>
        </v-list>
    </v-snackbar>

    <!-- display area for busy routing indicator -->
    <v-overlay v-model="isBusyRouting" class="align-center justify-center"
        ><v-progress-circular indeterminate></v-progress-circular
    ></v-overlay>
</template>

<script setup lang="ts">
/** A simple overlay display of the latest application error messages and other
 * feedback */
import { storeToRefs } from 'pinia';
import { useMessageStore } from '@/store/messages';

const message = useMessageStore();
const {
    progressMessages,
    hasProgressMessage,
    errorMessages,
    hasErrorMessages,
    inputFeedback,
    hasInputFeedback,
    successMessages,
    hasSuccessMessages,
    isBusyRouting,
} = storeToRefs(message);

function dismissError() {
    message.popError();
}

function dismissSuccess() {
    message.popSuccess();
}
</script>
