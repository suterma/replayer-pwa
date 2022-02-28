<template>
    <Compilation
        v-if="hasCompilation"
        :compilation="compilation"
        :tracksDisplayMode="this.tracksDisplayMode"
        @update="onCompilationUpdate"
    />

    <div v-else class="box has-background-transparent">
        <p class="has-text-centered">
            Replayer is a free, cue-based media player for rehearsals with
            playback music.
        </p>
    </div>

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
import { ICompilation, TrackDisplayMode } from '@/store/compilation-types';
import { ActionTypes } from '@/store/action-types';

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'Edit',
    components: {
        Compilation,
        MediaDropZone,
    },
    data() {
        return {
            /** Whether the media drop zone is displayed in the expanded state */
            isExpanded: true,

            /** Whether the compilation is shown as editable */
            tracksDisplayMode: TrackDisplayMode.Edit,
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
            console.debug('loadDemo:', url);

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
