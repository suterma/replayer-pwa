<template>
    <div class="container">
        <h1 class="title">Options</h1>

        <div class="field">
            <div class="control">
                <label class="checkbox">
                    <input
                        type="checkbox"
                        :checked="this.options.neverShowWelcomeMessageAgain"
                        @change="neverShowAgainChanged"
                    />
                    Never show the welcome message again
                </label>
            </div>
        </div>

        <div class="field">
            <div class="control">
                <label class="checkbox">
                    <input
                        type="checkbox"
                        :checked="
                            this.$store.getters.options
                                .autoRetrieveLastCompilation
                        "
                        @change="autoRetrieveLastCompilationChanged"
                    />
                    Automatically retrieve the last compilation at startup
                    <span class="has-opacity-half is-size-7">
                        (if available, and not overridden by a URL
                        parameter)</span
                    >
                </label>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MutationTypes } from '@/store/mutation-types';
import { Options } from '@/store/state-types';

/** An Options view
 */
export default defineComponent({
    name: 'Options',

    methods: {
        neverShowAgainChanged(event: Event) {
            const checked = (event.target as HTMLInputElement)?.checked;
            const options = this.options;

            options.neverShowWelcomeMessageAgain = checked;

            this.$store.commit(MutationTypes.UPDATE_OPTIONS, options);
        },
        autoRetrieveLastCompilationChanged(event: Event) {
            const checked = (event.target as HTMLInputElement)?.checked;
            const options = this.options;

            options.autoRetrieveLastCompilation = checked;

            this.$store.commit(MutationTypes.UPDATE_OPTIONS, options);
        },
    },
    computed: {
        /** Get the application options */
        options(): Options {
            return this.$store.getters.options;
        },
    },
});
</script>
