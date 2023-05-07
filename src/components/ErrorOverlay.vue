<template>
    <div :class="{ modal: true, 'is-active': hasErrorMessages }">
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
        ...mapState(useMessageStore, ['errorMessages', 'hasErrorMessages']),
    },
    methods: {
        ...mapActions(useAppStore, [
            'addDefaultTrack',
            'loadFromFile',
            'updateTrackUrl',
        ]),
        ...mapActions(useMessageStore, ['popError']),
        dismiss() {
            this.popError();
        },
    },
});
</script>
<style scoped>
.notification {
    padding-top: 2.25rem;
    padding-right: 3.5rem;
    padding-bottom: 2.25rem;
    padding-left: 2.5rem;

    margin-bottom: 1rem;
    margin-top: 1rem;
}

.notification > .delete {
    right: 1rem;
    top: 1rem;
}
</style>
