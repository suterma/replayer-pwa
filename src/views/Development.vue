<template>
    <h1 class="title has-text-danger">Upcoming features for evaluation</h1>
    <h2 class="subtitle">XML export</h2>

    <template v-if="hasCompilation">
        <h2 class="subtitle">See the compilation as XML</h2>
        <CompilationXmlDisplay :compilation="compilation" />
    </template>
    <template v-else>
        <p>Please load a compilation first</p>
    </template>
    <hr />
    <h1 class="title">Tests</h1>
    <h2 class="subtitle">Loader component with various compilations</h2>
    <p>
        Try one of the various compilations to check out the various features:
    </p>
    <ul>
        <li>
            <a href="/#/play/demo-compilation-featuring-lidija-roos.rez"
                >Demo package with a compilation featuring Lidija Roos</a
            ><br />
            A REZ Package containing an REX compilation with 2 tracks and
            matching mp3 files.
        </li>
        <li>
            <a href="/#/play/Demo%20Adonia%20Junior%2021.bplist"
                >Demo Binary Property List compilation (as from the LivePlayback
                app)</a
            ><br />
            A bplist file with 21 tracks (no media files).
        </li>
    </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ICompilation } from '@/store/compilation-types';
import CompilationXmlDisplay from '@/components/CompilationXmlDisplay.vue';

export default defineComponent({
    components: {
        CompilationXmlDisplay,
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
