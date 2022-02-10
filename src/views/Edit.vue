<template>
    <ToggleButton v-model="isEditable" onText="Edit" offText="Play" />

    <Compilation
        :compilation="compilation"
        v-if="hasCompilation"
        :isEditable="this.isEditable"
        @update="onCompilationUpdate"
    />
    <MediaDropZone
        :is-expanded="this.isExpanded"
        @update:is-expanded="updateExpanded"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Compilation from '@/components/Compilation.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import ToggleButton from '@/components/ToggleButton.vue';
import { ICompilation } from '@/store/compilation-types';

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'Edit',
    components: {
        Compilation,
        MediaDropZone,
        ToggleButton,
    },
    data() {
        return {
            /** Whether the media drop zone is displayed in the expanded state */
            isExpanded: true,

            /** Whether the compilatio is shown as editable */
            isEditable: true,
        };
    },
    mounted: function (): void {
        /* Check whether a compilation (most possible having a track) is available.
         * Then, collapse the media drop zone to keep the ui clean. */
        if (this.hasCompilation) {
            this.isExpanded = false;
        }
    },
    methods: {
        onCompilationUpdate() {
            console.debug('//TODO implement');
        },
        updateExpanded(isExpanded: boolean) {
            this.isExpanded = isExpanded;
        },
    },
    watch: {
        /** Watches whether a compilation (most possible having a track) is available.
         * Then, collapse the media drop zone to keep the ui clean. */
        hasCompilation(hasCompilation) {
            this.isExpanded = !hasCompilation;
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
