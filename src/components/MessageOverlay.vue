<template>
    <!-- Display area for messages -->
    <div
        :class="{
            modal: true,
            'is-active': hasErrorMessages | hasSuccessMessages,
        }"
    >
        <div class="modal-background"></div>
        <div class="modal-content">
            <div v-for="errorMessage in errorMessages" :key="errorMessage">
                <div
                    class="notification is-danger"
                    data-cy="notification-danger"
                    @click="dismiss"
                >
                    <button
                        class="delete is-large"
                        aria-label="delete"
                        @click="dismiss"
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
</template>
<script lang="ts">
import { useAppStore } from '@/store/app';
import { useMessageStore } from '@/store/messages';
import { mapActions, mapState } from 'pinia';
import { defineComponent } from 'vue';
/** A simple overlay display of the latest application error message, if any */
export default defineComponent({
    name: 'MessageOverlay',
    components: {},
    computed: {
        ...mapState(useMessageStore, [
            'successMessages',
            'errorMessages',
            'hasErrorMessages',
            'hasSuccessMessages',
            'inputFeedback',
            'hasInputFeedback',
        ]),
    },
    methods: {
        ...mapActions(useAppStore, [
            'addDefaultTrack',
            'loadFromFile',
            'updateTrackUrl',
        ]),
        ...mapActions(useMessageStore, ['popError', 'popSuccess']),
        dismiss() {
            this.popError();
        },
        dismissSuccess() {
            this.popSuccess();
        },
    },
});
</script>
