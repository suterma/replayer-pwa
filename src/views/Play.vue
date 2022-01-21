<template>
    <!-- Handle and translate the keyboard shortcuts into Replayer events -->
    <!-- This is only used on the play view, because it otherwise disturbs editing -->
    <CompilationKeyboardHandler />

    <!-- Create some top space to keep the layout more relaxed -->
    <div class="mt-6">
        <!-- Loader for importable files, also listens to url params -->
        <RezLoader v-if="!hasCompilation" />
    </div>

    <Compilation :compilation="compilation" v-if="hasCompilation" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RezLoader from '@/components/RezLoader.vue'; // @ is an alias to /src
import Compilation from '@/components/Compilation.vue'; // @ is an alias to /src
import { ICompilation, ITrack } from '@/store/compilation-types';
import CompilationKeyboardHandler from '@/components/CompilationKeyboardHandler.vue';

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'Play',
    components: {
        RezLoader,
        Compilation,
        CompilationKeyboardHandler,
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
