<template>
    <div :class="{ modal: true, 'is-active': showDialog }" v-if="showDialog">
        <div class="modal-background"></div>

        <div class="modal-card">
            <header class="modal-card-head">
                <h1 class="modal-card-title title">Welcome</h1>
            </header>
            <section class="modal-card-body">
                <WelcomeText />
            </section>
            <footer class="modal-card-foot is-justify-content-flex-end">
                <div class="field is-grouped">
                    <p class="control">
                        <label class="checkbox field-label">
                            <input
                                type="checkbox"
                                v-model="neverShowAgainChecked"
                                @change="neverShowAgainChanged()"
                            />
                            Never show again
                        </label>
                    </p>
                    <p class="control">
                        <button
                            class="button is-success pl-6 pr-6"
                            @click="showDialog = false"
                        >
                            Ok
                        </button>
                    </p>
                </div>
            </footer>
        </div>
    </div>
</template>
<script lang="ts">
import { MutationTypes } from '@/store/mutation-types';
import { defineComponent } from 'vue';
import WelcomeText from '@/components/WelcomeText.vue';

/** A simple overlay display with a welcome message for a new user
 * @remarks This component can be permanently dismissed
 */
export default defineComponent({
    name: 'WelcomeMessage',
    components: { WelcomeText },
    data() {
        return {
            /** Whether to show the message this time*/
            showDialog: false,
            /** Whether the checkbox for "never show again" has been checked */
            neverShowAgainChecked: false,
        };
    },
    beforeMount() {
        //Decide whether to actually show this dialog now, before mounting it, to avoid any flicker
        this.showDialog = !this.isNeverShowAgain === true;
    },
    methods: {
        neverShowAgainChanged() {
            this.$store.commit(
                MutationTypes.UPDATE_NEVER_SHOW_WELCOME_MESSAGE_AGAIN,
                this.neverShowAgainChecked,
            );
        },
    },
    computed: {
        /** Whether the welcome message has been permanently dismissed */
        isNeverShowAgain(): boolean {
            return this.$store.getters.neverShowWelcomeMessageAgain;
        },
    },
});
</script>
