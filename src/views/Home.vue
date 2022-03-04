<template>
    <div class="container">
        <h1 class="title">Welcome!</h1>

        <p>
            <a href="https://replayer.app" target="_blank">Replayer</a> is a
            free, cue-based media player for rehearsals with playback music. By
            the click of a button, Replayer starts to play at predefined times
            in the audio file.
        </p>

        <div class="content">
            <WelcomeText />
            <p>
                <router-link to="/edit" class="">
                    <button class="button is-success is-large">
                        Get Started!
                    </button>
                </router-link>
            </p>
            <p title="App info" class="has-text-right is-italic">
                <small
                    >App version: {{ version }} ({{ environment }}),
                    {{ git }}</small
                >
            </p>

            <hr />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import WelcomeText from '@/components/WelcomeText.vue';

/** A Home view
 */
export default defineComponent({
    name: 'Home',
    components: { WelcomeText },
    computed: {
        version(): string {
            return '' + process.env.VUE_APP_VERSION;
        },

        environment(): string {
            return '' + process.env.NODE_ENV;
        },
        git(): string {
            return 'git version: ' + process.env.VUE_APP_GIT_VERSION;
        },
    },
});
</script>
