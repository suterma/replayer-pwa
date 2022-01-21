<template>
    <Compilation
        :compilation="compilation"
        v-if="hasCompilation"
        :isEditable="true"
        @update="onCompilationUpdate"
    />
    <MediaDropZone />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Compilation from '@/components/Compilation.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import { ICompilation } from '@/store/compilation-types';

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'Edit',
    components: {
        Compilation,
        MediaDropZone,
    },
    methods: {
        onCompilationUpdate() {
            console.debug('//TODO implement');
        },
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
