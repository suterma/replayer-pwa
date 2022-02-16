<template>
    <Compilation
        v-if="hasCompilation"
        :compilation="compilation"
        :isEditable="this.isEditable"
        @update="onCompilationUpdate"
    />

    <div v-else class="box has-background-transparent">
        <p class="has-text-centered">
            Replayer is a free, cue-based media player for rehearsals with
            playback music. <br />By the click of a button, Replayer starts to
            play at predefined times in the audio file.
        </p>
    </div>

    <CompilationLoader />

    <MediaDropZone
        :is-expanded="this.isExpanded"
        @update:is-expanded="updateExpanded"
    />
    <div v-if="!this.hasCompilation" class="level">
        <div class="level-item has-text-centered">
            <div class="ml-3 mr-3">&mdash; OR &mdash;</div>
            <button tabindex="50" class="button" @click="loadDemo()">
                Try the demo
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Compilation from '@/components/Compilation.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import { ICompilation } from '@/store/compilation-types';
import { ActionTypes } from '@/store/action-types';
import CompilationLoader from '@/components/CompilationLoader.vue'; // @ is an alias to /src

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'Edit',
    components: {
        Compilation,
        MediaDropZone,
        CompilationLoader,
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

        loadDemo() {
            const url =
                location.protocol +
                '//' +
                location.host +
                location.pathname +
                'demo-compilation-featuring-lidija-roos.rez';

            this.$store.dispatch(ActionTypes.LOAD_FROM_URL, url);
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
