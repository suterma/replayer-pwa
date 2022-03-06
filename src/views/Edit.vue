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

    <div v-if="!hasCompilation" class="content">
        <WelcomeText />
    </div>
    <Experimental>
        <hr />
        <MediaList />
    </Experimental>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Compilation from '@/components/Compilation.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import MediaList from '@/components/MediaList.vue';
import WelcomeText from '@/components/WelcomeText.vue';
import Experimental from '@/components/Experimental.vue';
import { ICompilation, TrackDisplayMode } from '@/store/compilation-types';

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'Edit',
    components: {
        Compilation,
        MediaDropZone,
        MediaList,
        Experimental,
        WelcomeText,
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
<style lang="css" scoped>
/** Add a margin at the top of the media drop zone level, to have a space between the tracks and the drop zone */
.media-drop-zone {
    margin-top: 1.5rem;
}
</style>
