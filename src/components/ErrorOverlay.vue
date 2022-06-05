<template>
    <div :class="{ modal: true, 'is-active': hasErrorMessage }">
        <article class="message is-danger">
            <div class="message-header">
                <p>Danger</p>
                <button
                    class="delete"
                    aria-label="delete"
                    @click="dismiss"
                ></button>
            </div>
            <div class="message-body">
                {{ errorMessage }}
            </div>
        </article>
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
        errorMessage(): string {
            return this.$store.getters.errorMessage;
        },
        hasErrorMessage(): boolean {
            return this.errorMessage != null && this.errorMessage.length > 0;
        },
    },
    methods: {
        dismiss() {
            this.$store.commit(MutationTypes.POP_ERROR, null);
        },
    },
});
</script>
