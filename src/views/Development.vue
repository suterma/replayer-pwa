<template>
    <h1 class="title">New components for evaluation</h1>

    <template v-if="hasCompilation">
        <h2 class="subtitle">See the compilation as XML</h2>
        <CompilationXmlDisplay :compilation="compilation" />
    </template>
    <template v-else>
        <p>Please load a compilation first</p>
    </template>
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
