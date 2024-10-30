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
    <div
        :class="{
            modal: true,
            'is-active': hasInputFeedback,
        }"
    >
        <div v-if="hasInputFeedback" data-cy="notification-input-feedback">
            <div class="has-text-centered">
                <!-- Note: use a large font for good visibility of the displayed info -->
                <!-- Note2: Zero margin bottom is to avoid a visible scrollbar -->
                <div class="tags has-addons has-opacity-half is-size-1 mb-0">
                    <span
                        class="tag is-large is-white is-size-1 is-family-monospace"
                        >{{ inputFeedback?.Data }}</span
                    >
                    <span class="tag is-dark is-large is-size-1">{{
                        inputFeedback?.Action
                    }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- display area for progress display -->
    <div :class="{ modal: true, 'is-active': hasProgressMessage }">
        <div class="modal-background"></div>
        <div class="modal-card">
            <section class="modal-card-body has-background-transparent">
                <template
                    v-for="progressMessage in progressMessages"
                    :key="progressMessage.Message"
                >
                    <!-- Show a level with circular indicator for progess with percentage -->
                    <template v-if="progressMessage.Percentage">
                        <div class="level is-mobile has-cropped-text mb-0">
                            <div
                                class="level-left"
                                style="max-width: calc(100% - 1.5em)"
                            >
                                <div class="level-item">
                                    <span>{{ progressMessage.Message }}</span>
                                </div>
                            </div>

                            <div class="level-right">
                                <div class="level-item">
                                    <CircularProgress
                                        class="is-success is-colorless"
                                        :value="progressMessage.Percentage"
                                    />
                                </div>
                            </div>
                        </div>
                    </template>
                    <!-- For text-only progress show a line and separate marquee -->
                    <template v-else>
                        <div class="has-cropped-text">
                            <span>{{ progressMessage.Message }}</span>
                        </div>
                        <progress
                            class="progress is-indicator"
                            max="100"
                        ></progress>
                    </template>
                </template>
            </section>
        </div>
    </div>

    <!-- display area for busy routing indicator -->
    <div class="modal busy-indicator" :class="{ 'is-active': isBusyRouting }">
        <div class="modal-background"></div>
        <div class="modal-content is-loading">
            <!--  just show a spinner -->
            <div class="has-text-centered">
                <div class="button is-loading is-ghost is-large"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/** A simple overlay display of the latest application error messages and other
 * feedback */
import { storeToRefs } from 'pinia';
import { useMessageStore } from '@/store/messages';
import CircularProgress from '@/components/indicators/CircularProgress.vue';

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
