<template>
    <div :class="{ modal: true, 'is-active': hasErrorMessages }">
        <div class="modal-background"></div>
        <div class="modal-content">
            <div v-for="errorMessage in errorMessages" :key="errorMessage">
                <div class="notification is-danger" @click="dismiss">
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
import { MutationTypes } from '@/store/mutation-types';
import { defineComponent } from 'vue';
/** A simple overlay display of the latest application error message, if any */
export default defineComponent({
    name: 'ErrorOverlay',
    components: {},
    computed: {
        errorMessages(): string[] {
            return this.$store.getters.errorMessages;
        },
        hasErrorMessages(): boolean {
            return this.errorMessages != null && this.errorMessages.length > 0;
        },
    },
    methods: {
        dismiss() {
            this.$store.commit(MutationTypes.POP_ERROR, null);
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
