<template>
    <div class="container">
        <h1 class="title">Settings</h1>

        <div class="field">
            <div class="control">
                <label class="checkbox">
                    <input
                        type="checkbox"
                        :checked="this.settings.neverShowWelcomeMessageAgain"
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
                            this.$store.getters.settings
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
import { Settings } from '@/store/state-types';

/** A Settings view
 */
export default defineComponent({
    name: 'Settings',

    methods: {
        neverShowAgainChanged(event: Event) {
            const checked = (event.target as HTMLInputElement)?.checked;
            const settings = this.settings;

            settings.neverShowWelcomeMessageAgain = checked;

            this.$store.commit(MutationTypes.UPDATE_SETTINGS, settings);
        },
        autoRetrieveLastCompilationChanged(event: Event) {
            const checked = (event.target as HTMLInputElement)?.checked;
            const settings = this.settings;

            settings.autoRetrieveLastCompilation = checked;

            this.$store.commit(MutationTypes.UPDATE_SETTINGS, settings);
        },
    },
    computed: {
        /** Get the application settings */
        settings(): Settings {
            return this.$store.getters.settings;
        },
    },
});
</script>
