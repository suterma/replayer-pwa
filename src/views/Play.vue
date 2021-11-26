<template>
    <template v-if="!hasCompilation">
        <!-- Loader for importable files, also listens to url params -->
        <RezLoader />
    </template>

    <button
        title="Close"
        class="button is-secondary is-pulled-right"
        @click="close"
        v-if="hasCompilation"
    >
        <!-- CLOSE -->
        <!-- <span>Close</span> -->
        <span class="icon">
            <i class="mdi mdi-24px">
                <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                    />
                </svg>
            </i>
        </span>
    </button>

    <CompilationDisplay :compilation="compilation" v-if="hasCompilation" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RezLoader from '@/components/RezLoader.vue'; // @ is an alias to /src
import CompilationDisplay from '@/components/CompilationDisplay.vue'; // @ is an alias to /src
import { ICompilation, ITrack } from '@/store/compilation-types';
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
    },
});
</script>
