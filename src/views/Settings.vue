<template>
    <div class="container">
        <h1 class="title">Settings</h1>

        <h3 class="subtitle">General</h3>

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

        <div class="field">
            <div class="control">
                <label class="checkbox">
                    <input
                        type="checkbox"
                        :checked="this.getSettings.preventScreenTimeout"
                        @change="preventScreenTimeoutChanged"
                    />
                    Always prevent screen timeout while any track is in use (is
                    expanded and was played)
                    <span class="has-opacity-half is-size-7">
                        (Uses more energy)</span
                    >
                </label>
            </div>
        </div>

        <h3 class="subtitle">Audio</h3>

        <div class="field">
            <div class="control">
                <label class="label">
                    Note: The audio settings are applied only at next app start
                    <span class="has-opacity-half is-size-7">
                        (If available, in the browser, you can use use the
                        "Reload" button. Otherwise terminate and re-open the
                        app.)</span
                    >
                </label>
            </div>
        </div>

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
                        (supports fading)</span
                    >
                </label>
            </div>
        </div>
        <!-- Fading durations, with two columns -->
        <div class="columns">
            <div class="column">
                <div class="field">
                    <label class="label"
                        >Fade-in duration
                        <span class="has-opacity-half is-size-7">
                            (For play operations)</span
                        >
                    </label>
                    <div class="control">
                        <div class="select">
                            <select
                                v-model.number="
                                    this.localSettings.fadeInDuration
                                "
                                @change="fadeInDurationChanged"
                                class=""
                            >
                                <option v-bind:value="0">no fading</option>
                                <option v-bind:value="20">
                                    20 milliseconds
                                </option>
                                <option v-bind:value="50">
                                    50 milliseconds
                                </option>
                                <option v-bind:value="100">
                                    100 milliseconds
                                </option>
                                <option v-bind:value="200">
                                    200 milliseconds
                                </option>
                                <option v-bind:value="500">
                                    500 milliseconds
                                </option>
                                <option v-bind:value="1000">1 seconds</option>
                                <option v-bind:value="2000">2 seconds</option>
                                <option v-bind:value="5000">5 seconds</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="column">
                <div class="field">
                    <label class="label"
                        >Fade-out duration
                        <span class="has-opacity-half is-size-7">
                            (For pause operations)</span
                        >
                    </label>
                    <div class="control">
                        <div class="select">
                            <select
                                v-model.number="
                                    this.localSettings.fadeOutDuration
                                "
                                @change="fadeOutDurationChanged"
                                class=""
                            >
                                <option v-bind:value="0">no fading</option>
                                <option v-bind:value="20">
                                    20 milliseconds
                                </option>
                                <option v-bind:value="50">
                                    50 milliseconds
                                </option>
                                <option v-bind:value="100">
                                    100 milliseconds
                                </option>
                                <option v-bind:value="200">
                                    200 milliseconds
                                </option>
                                <option v-bind:value="500">
                                    500 milliseconds
                                </option>
                                <option v-bind:value="1000">1 seconds</option>
                                <option v-bind:value="2000">2 seconds</option>
                                <option v-bind:value="5000">5 seconds</option>
                            </select>
                        </div>
                    </div>
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
                        (The offset compensates for the fade-in duration)</span
                    >
                </label>
            </div>
        </div>

        <!-- Experimental settings -->
        <!-- <hr />

        <div class="has-text-danger">
            <h1 class="title has-text-danger">Experimental settings</h1>
            <h3 class="subtitle has-text-danger">
                Here be dragons (use at your own risk)
            </h3>
        </div> -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MutationTypes } from '@/store/mutation-types';
import { settingsMixin } from '@/mixins/settingsMixin';
import { Settings } from '@/store/state-types';

/** A Settings view
 */
export default defineComponent({
    name: 'Settings',
    mixins: [settingsMixin],
    data: () => ({
        localSettings: undefined as unknown as Settings,
    }),
    created() {
        this.localSettings = this.getSettings;
    },
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
        preventScreenTimeoutChanged(event: Event) {
            const checked = (event.target as HTMLInputElement)?.checked;
            const settings = this.getSettings;

            settings.preventScreenTimeout = checked;

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
        fadeInDurationChanged(event: Event) {
            console.debug('event', event);
            this.$store.commit(MutationTypes.UPDATE_SETTINGS, this.settings);
        },
        fadeOutDurationChanged(event: Event) {
            console.debug('event', event);
            this.$store.commit(MutationTypes.UPDATE_SETTINGS, this.settings);
        },
    },
});
</script>
