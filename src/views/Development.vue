<template>
    <h1>1) Select a REZ or ZIP file</h1>
    <RezLoader />

    <template v-if="compilation">
        <h1>2) See the compilation as XML</h1>
        <CompilationXmlDisplay :compilation="compilation" />
    </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RezLoader from '@/components/RezLoader.vue'; // @ is an alias to /src
import { ICompilation } from '@/store/compilation-types';
import CompilationXmlDisplay from '@/components/CompilationXmlDisplay.vue';

export default defineComponent({
    components: {
        RezLoader,
        CompilationXmlDisplay,
    },
    computed: {
        compilation(): ICompilation {
            return this.$store.getters.compilation;
        },
    },
});
</script>
