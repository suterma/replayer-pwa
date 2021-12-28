<template>
    <div class="container">
        <h1 class="title">Settings</h1>

        <div class="field">
            <div class="control">
                <label class="checkbox">
                    <input
                        type="checkbox"
                        :checked="this.getSettings.neverShowWelcomeMessageAgain"
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
                        :checked="this.getSettings.autoRetrieveLastCompilation"
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

        <hr />

        <div class="has-text-danger">
            <h1 class="title has-text-danger">Experimental settings</h1>
            <h3 class="subtitle has-text-danger">
                Here be dragons (use at your own risk)
            </h3>

            <div class="field">
                <div class="control">
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            :checked="this.getSettings.useHowlerJsAudioEngine"
                            @change="useHowlerJsAudioEngineChanged"
                        />
                        Use howler.js as audio engine
                        <span class="has-opacity-half is-size-7">
                            (may behave differently on playback)</span
                        >
                    </label>
                </div>
            </div>

            <div class="field">
                <label class="label"
                    >Fading duration
                    <span class="has-opacity-half is-size-7">
                        (For play and pause operations)</span
                    >
                </label>
                <div class="control">
                    <div class="select">
                        //TODO fix this binding
                        <!-- <select
                            v-model.number="this.getSettings.fadingDuration"
                            @change="fadingDurationChanged"
                        >
                            <option v-bind:value="{ number: 0 }">
                                no fading
                            </option>
                            <option v-bind:value="{ number: 16 }">
                                Fast (16 milliseconds, barely audible)
                            </option>
                            <option v-bind:value="{ number: 300 }">
                                Medium (300 milliseconds)
                            </option>
                            <option v-bind:value="{ number: 4000 }">
                                Slow (4 seconds)
                            </option>
                        </select> -->
                    </div>
                </div>
            </div>

            <div class="field">
                <div class="control">
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            :checked="this.getSettings.applyFadeInOffset"
                            @change="applyFadeInOffsetChanged"
                        />
                        Apply an offset before fade-in operations
                        <span class="has-opacity-half is-size-7">
                            (The offset compensates for the fade-in
                            duration)</span
                        >
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MutationTypes } from '@/store/mutation-types';
import { settingsMixin } from '@/mixins/settingsMixin';

/** A Settings view
 */
export default defineComponent({
    name: 'Settings',
    mixins: [settingsMixin],
    methods: {
        neverShowAgainChanged(event: Event) {
            const checked = (event.target as HTMLInputElement)?.checked;
            const settings = this.getSettings;

            settings.neverShowWelcomeMessageAgain = checked;

            this.$store.commit(MutationTypes.UPDATE_SETTINGS, settings);
        },
        autoRetrieveLastCompilationChanged(event: Event) {
            const checked = (event.target as HTMLInputElement)?.checked;
            const settings = this.getSettings;

            settings.autoRetrieveLastCompilation = checked;

            this.$store.commit(MutationTypes.UPDATE_SETTINGS, settings);
        },

        useHowlerJsAudioEngineChanged(event: Event) {
            const checked = (event.target as HTMLInputElement)?.checked;
            const settings = this.getSettings;

            settings.useHowlerJsAudioEngine = checked;

            this.$store.commit(MutationTypes.UPDATE_SETTINGS, settings);
        },

        applyFadeInOffsetChanged(event: Event) {
            const checked = (event.target as HTMLInputElement)?.checked;
            const settings = this.getSettings;

            settings.applyFadeInOffset = checked;

            this.$store.commit(MutationTypes.UPDATE_SETTINGS, settings);
        },
    },
});
</script>
