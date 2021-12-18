<template>
    <!-- Loader for importable files, also listens to url params -->
    <RezLoader v-if="!hasCompilation" />

    <Compilation :compilation="compilation" v-if="hasCompilation" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RezLoader from '@/components/RezLoader.vue'; // @ is an alias to /src
import Compilation from '@/components/Compilation.vue'; // @ is an alias to /src
import { ICompilation, ITrack } from '@/store/compilation-types';

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'Play',
    components: {
        RezLoader,
        Compilation,
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
