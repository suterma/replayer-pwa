<template>
    <CompilationLoader />

    <!-- Handle and translate the keyboard shortcuts into Replayer events -->
    <!-- This is only used for playback view only, because it otherwise disturbs editing -->
    <CompilationKeyboardHandler v-if="!this.isEditMode" />

    <!-- Show a loading panel, similar to the edit view, but not in edit mode -->
    <Compilation
        v-if="hasCompilation"
        :compilation="compilation"
        :tracksDisplayMode="this.tracksDisplayMode"
    />

    <div v-else class="section pl-0 pr-0">
        <p class="has-text-centered">
            Replayer is a free, cue-based media player for rehearsals with
            playback music.
        </p>
    </div>
    <div class="section pl-0 pr-0">
        <!-- v-click-outside seems not to work well with v-if -->
        <!-- Additionally, v-show seems not to work properly when used directly on the MediaDropZone-Element, thus it's applied to an extra div -->
        <div v-show="this.isEditMode || !hasCompilation">
            <MediaDropZone
                v-model:isExpanded="isMediaDropZoneExpanded"
                v-click-outside="clickedOutside"
            />
        </div>
    </div>
    <div v-if="!hasCompilation" class="section pl-0 pr-0 content">
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
import { ICompilation, TrackDisplayMode } from '@/store/compilation-types';
import MediaDropZone from '@/components/MediaDropZone.vue';
import WelcomeText from '@/components/WelcomeText.vue';
import Experimental from '@/components/Experimental.vue';
import CompilationLoader from '@/components/CompilationLoader.vue';
import MediaList from '@/components/MediaList.vue';
import CompilationKeyboardHandler from '@/components/CompilationKeyboardHandler.vue';

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'Play',
    components: {
        Compilation,
        CompilationKeyboardHandler,
        MediaDropZone,
        CompilationLoader,
        WelcomeText,
        Experimental,
        MediaList,
    },
    data() {
        return {
            /** Whether the media drop zone is displayed in the expanded state */
            isMediaDropZoneExpanded: false,
        };
    },
    beforeMount() {
        //Immediately apply the hasCompilation watch with the current state. (Emulates the "immediate watch" from vue2 in the options API)
        this.updateMediaDropZoneExpansion(!this.hasCompilation);
    },
    watch: {
        /** When the compilation loads or closes, update the media loader expansion accordingly
         * @remarks When there is already something loaded, only the unobtrusive icon should be shown
         */
        hasCompilation(newVal): void {
            this.updateMediaDropZoneExpansion(!newVal);
        },
    },
    methods: {
        clickedOutside(): void {
            console.log('Play::v-click-outside:MediaDropZone');
            this.isMediaDropZoneExpanded = !this.hasCompilation;
        },

        updateMediaDropZoneExpansion(expanded: boolean): void {
            this.isMediaDropZoneExpanded = expanded;
        },
    },
    computed: {
        compilation(): ICompilation {
            return this.$store.getters.compilation;
        },

        hasCompilation(): boolean {
            return this.$store.getters.hasCompilation;
        },

        tracksDisplayMode(): TrackDisplayMode {
            if (this.isEditMode) {
                return TrackDisplayMode.Edit;
            }
            return TrackDisplayMode.Collapsible;
        },
        /** Whether the compilation is shown as editable */
        isEditMode(): boolean {
            return this.$route.name === 'Edit';
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
