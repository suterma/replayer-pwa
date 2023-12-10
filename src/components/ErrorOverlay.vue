<template>
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
                    @click="dismiss"
                    data-cy="notification-danger"
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
                    @click="dismissSuccess"
                    data-cy="notification-success"
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
</template>
<script lang="ts">
import { useAppStore } from '@/store/app';
import { useMessageStore } from '@/store/messages';
import { mapActions, mapState } from 'pinia';
import { defineComponent } from 'vue';
/** A simple overlay display of the latest application error message, if any */
export default defineComponent({
    name: 'ErrorOverlay',
    components: {},
    computed: {
        ...mapState(useMessageStore, [
            'successMessages',
            'errorMessages',
            'hasErrorMessages',
            'hasSuccessMessages',
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
