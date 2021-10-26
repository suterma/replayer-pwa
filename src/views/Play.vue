<template>
    <template v-if="!hasCompilation">
        <p>
            Welcome to the
            <a href="https://replayer.app/" alt="Link to the Replayer website"
                >Replayer Web App</a
            >, a player for existing compilations from
            <a href="https://replayer.app/" alt="Link to the Replayer website"
                >Replayer Classic</a
            >.
        </p>

        <!-- Loader for importable files, also listens to url params -->
        <RezLoader />

        <hr />

        <p>
            <a href="https://replayer.app/" alt="Link to the Replayer website"
                >Replayer</a
            >
            is a free, cue-based media player for rehearsals with playback
            music. By the click of a button, you can start to play at predefined
            times in the audio file.
        </p>

        <p>
            Go to

            <router-link to="/development">Development</router-link>

            to try upcoming features.
        </p>
    </template>

    <button
        class="button is-secondary is-pulled-right"
        @click="close"
        v-if="hasCompilation"
    >
        <span>Close</span>
        <span class="icon is-small">
            <i class="fas fa-times"></i>
        </span>
    </button>

    <CompilationDisplay :compilation="compilation" v-if="hasCompilation" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RezLoader from '@/components/RezLoader.vue'; // @ is an alias to /src
import CompilationDisplay from '@/components/CompilationDisplay.vue'; // @ is an alias to /src
import { ICompilation, ITrack } from '@/store/compilation-types';
import { MediaFile } from '@/store/state-types';
import { MutationTypes } from '@/store/mutation-types';

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'Play',
    components: {
        RezLoader,
        CompilationDisplay,
    },
    methods: {
        /** Closes the compilation and starts with a fresh play page
         * @devdoc Only after route replacemnt actually is finished do close,
         * because otherwise the parameters might trigger an immediate reload.
         */
        close(): void {
            this.$router
                .replace({
                    params: {
                        url: '',
                    },
                })
                .then(() =>
                    this.$store.commit(MutationTypes.CLOSE_COMPILATION),
                );
        },
    },
    computed: {
        compilation(): ICompilation {
            return this.$store.getters.compilation;
        },

        hasCompilation(): boolean {
            return this.$store.getters.hasCompilation;
        },

        tracks(): Array<string> {
            return (this.$store.getters.compilation as ICompilation).Tracks.map(
                function (item: ITrack) {
                    return item.Name;
                },
            );
        },
        fileUrls(): Array<MediaFile> {
            return this.$store.getters.fileUrls;
        },
    },
});
</script>
