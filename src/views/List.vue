<template>
    <Experimental>
        <!-- Handle and translate the keyboard shortcuts into Replayer events -->
        <!-- This is only used for playback view, because it otherwise disturbs editing -->
        <CompilationKeyboardHandler />

        <Compilation
            :compilation="compilation"
            v-if="hasCompilation"
            :tracksDisplayMode="tracksDisplayMode"
        />
    </Experimental>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Compilation from '@/components/Compilation.vue';
import { ICompilation, TrackDisplayMode } from '@/store/compilation-types';
import CompilationKeyboardHandler from '@/components/CompilationKeyboardHandler.vue';
import Experimental from '@/components/Experimental.vue';

/** A Display of a complete compilation, with a simple track listing */
export default defineComponent({
    name: 'List',
    components: {
        Compilation,
        CompilationKeyboardHandler,
        Experimental,
    },
    data() {
        return {
            /** Whether the compilation is shown as editable */
            tracksDisplayMode: TrackDisplayMode.Link,
        };
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
