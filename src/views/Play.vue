<template>
    <CompilationLoader />

    <!-- Handle and translate the keyboard shortcuts into Replayer events -->
    <!-- In playback view, do not require the CTRL modifier -->
    <!-- In edit view, the CTRL modifier helps disambiguate
         between other uses of the shortcut keys-->
    <CompilationKeyboardHandler :requireCtrlModifier="isEditMode" />

    <!-- Show a loading panel, similar to the edit view, but not in edit mode -->
    <Compilation
        v-if="hasCompilation"
        :compilation="compilation"
        :tracksDisplayMode="tracksDisplayMode"
    />

    <div v-else class="section pl-0 pr-0">
        <p class="has-text-centered">
            Replayer is a free, cue-based media player for rehearsals with
            playback music.
        </p>
    </div>
    <div class="section pl-0 pr-0" v-show="isEditMode || !hasCompilation">
        <!-- v-click-outside seems not to work well with v-if -->
        <!-- Additionally, v-show seems not to work properly when used directly on the MediaDropZone-Element, thus it's applied to an extra div -->
        <div class="media-loader">
            <!-- Offer the demo only when no compilation/track is shown -->
            <MediaDropZone
                v-model:isExpanded="isMediaDropZoneExpanded"
                v-click-outside="clickedOutside"
                :offerDemo="!hasCompilation"
            />
        </div>
    </div>
    <div class="section pl-0 pr-0" v-if="!hasCompilation">
        <div class="content box">
            <WelcomeText />
        </div>
    </div>
    <Experimental>
        <hr />
        <MediaList />
    </Experimental>

    <!-- The bottom nav bar, used for the media player widget for the active track -->
    <nav
        class="navbar is-fixed-bottom"
        role="form"
        id="media-player"
        aria-label="media player"
    ></nav>

    <!-- A placeholder that invisibly extends the bottom for the experimental content in the fixed bottom bar -->
    <Experimental>
        <div style="height: 224px"></div>
    </Experimental>
    <!-- A placeholder that invisibly extends the track list bottom,
      taking into account the player widget 
      Note: this extension is intentionally not set on the body or html, because
      the corresponding navbar is only shown in this view, not generally
      for the whole application.
    -->
    <div class="has-navbar-fixed-bottom"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Compilation from '@/components/Compilation.vue';
import { ICompilation, TrackDisplayMode } from '@/store/compilation-types';
import MediaDropZone from '@/components/MediaDropZone.vue';
import WelcomeText from '@/components/WelcomeText.vue';
import CompilationLoader from '@/components/CompilationLoader.vue';
import MediaList from '@/components/MediaList.vue';
import CompilationKeyboardHandler from '@/components/CompilationKeyboardHandler.vue';

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'Play',
    id: 'play-view',
    components: {
        Compilation,
        CompilationKeyboardHandler,
        MediaDropZone,
        CompilationLoader,
        WelcomeText,
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
            //console.log('Play::v-click-outside:MediaDropZone');
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
            const hasCompilation = this.$store.getters.hasCompilation;
            console.log(`Play::hasCompilation:${hasCompilation}`);
            return hasCompilation;
        },

        tracksDisplayMode(): TrackDisplayMode {
            if (this.isEditMode) {
                return TrackDisplayMode.Edit;
            }
            return TrackDisplayMode.Play;
        },
        /** Whether the compilation is shown as editable */
        isEditMode(): boolean {
            return this.$route.name === 'Edit';
        },
    },
});
</script>
<style lang="scss" scoped>
/** Add a margin at the top of the media loader level, to have a space between the tracks and the loader */
.media-loader {
    margin-top: 1.5rem;
}

/* Handling the fixed bottom navbar for this view specifically */
/* Depending on the screen size, consider the stacked level items of the fixed bottom nav bar */
/* Note: Pixel counts are taken from the player widget section section, by manual evaluation
   plus 1em grace space */
div.has-navbar-fixed-bottom {
    padding-bottom: calc(168px + 1em);
}

@media screen and (min-width: 769px /* tablet */) {
    div.has-navbar-fixed-bottom {
        padding-bottom: calc(105px + 1em);
    }
}
@media screen and (min-width: 1024px) {
    div.has-navbar-fixed-bottom {
        padding-bottom: calc(216px + 1em);
    }
}

</style>
