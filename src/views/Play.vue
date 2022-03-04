<template>
    <!-- Handle and translate the keyboard shortcuts into Replayer events -->
    <!-- This is only used for playback view only, because it otherwise disturbs editing -->
    <CompilationKeyboardHandler />

    <!-- Show a loading panel, similar to the edit view, but not in edit mode -->
    <Compilation
        v-if="hasCompilation"
        :compilation="compilation"
        :tracksDisplayMode="this.tracksDisplayMode"
    />

    <div v-else class="box has-background-transparent">
        <p class="has-text-centered">
            Replayer is a free, cue-based media player for rehearsals with
            playback music.
        </p>
    </div>

    <MediaDropZone v-if="!hasCompilation" is-expanded="true" />
    <div v-if="!hasCompilation" class="content">
        <WelcomeText />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Compilation from '@/components/Compilation.vue';
import { ICompilation } from '@/store/compilation-types';
import MediaDropZone from '@/components/MediaDropZone.vue';
import WelcomeText from '@/components/WelcomeText.vue';
import CompilationKeyboardHandler from '@/components/CompilationKeyboardHandler.vue';

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'Play',
    components: {
        Compilation,
        CompilationKeyboardHandler,
        MediaDropZone,
        WelcomeText,
    },
    computed: {
        compilation(): ICompilation {
            return this.$store.getters.compilation;
        },

        hasCompilation(): boolean {
            return this.$store.getters.hasCompilation;
        },
    },
});
</script>
