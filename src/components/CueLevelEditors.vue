<template>
    <!-- Using the v-for on a template instead of the actual component saves unnecessary renderings. 
         See https://stackoverflow.com/a/76074016/79485 -->
    <template v-for="cue in cues" :key="cue.Id">
        <CueLevelEditor
            :disabled="disabled"
            :cue="cue"
            :isTrackPlaying="isTrackPlaying"
            :playbackMode="playbackMode"
            :isCueSelected="isCueSelected(cue)"
            :hasCuePassed="hasCuePassed(cue)"
            :isCueAhead="isCueAhead(cue)"
            :percentComplete="percentComplete(cue)"
            @click="cueClick(cue)"
            @play="cuePlay(cue)"
        />
    </template>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { ICue, PlaybackMode } from '@/store/compilation-types';
import CompilationHandler from '@/store/compilation-handler';
import CueLevelEditor from '@/components/CueLevelEditor.vue';
import { useAppStore } from '@/store/app';
import { mapState } from 'pinia';

/** An set of Editors for for cues in a track.
 */
export default defineComponent({
    name: 'CueLevelEditors',
    components: {
        CueLevelEditor,
    },
    emits: ['click', 'play'],
    props: {
        cues: {
            type: Array as PropType<Array<ICue>>,
            required: true,
        },
        disabled: {
            type: Boolean,
            required: false,
        },

        /** The playback progress in the current track, in [seconds]
         * @remarks This is used for progress display within the set of cues
         */
        currentSeconds: Number,

        /** Indicates whether the associated Track is currently playing
         * @remarks This is used to depict the expected action on button press.
         * While playing, this is pause, and vice versa.
         */
        isTrackPlaying: Boolean,

        /** The playback mode
         * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
         */
        playbackMode: {
            type: String as () => PlaybackMode,
            required: true,
        },
    },
    data() {
        return {};
    },

    methods: {
        /** Handles the click event of the cue button */
        cueClick(cue: ICue) {
            this.$emit('click', cue);
        },

        /** Handles the play event of the cue button */
        cuePlay(cue: ICue) {
            this.$emit('play', cue);
        },

        /** Determines whether this cue is currently selected
         * @remarks Note: only one cue in a compilation may be selected */
        isCueSelected(cue: ICue): boolean {
            //TODO use via provide/inject
            return this.selectedCueId === cue.Id;
        },

        /** Determines whether playback of the given cue has already passed
         * @remarks Is used for visual indication of playback progress
         * @param cue - the cue to determine the playback progress for
         */
        hasCuePassed(cue: ICue): boolean {
            return CompilationHandler.hasCuePassed(cue, this.currentSeconds);
        },
        /** Determines whether playback of the given cue has not yet started
         * @param cue - the cue to determine the playback progress for
         */
        isCueAhead(cue: ICue): boolean {
            return CompilationHandler.isCueAhead(cue, this.currentSeconds);
        },
        /** The playback progress within the given cue, in [percent], or null if not applicable
         * @param cue - the cue to determine the playback progress for
         */
        percentComplete(cue: ICue): number | null {
            return CompilationHandler.percentComplete(cue, this.currentSeconds);
        },
    },
    watch: {},
    computed: {
        ...mapState(useAppStore, ['selectedCueId']),
    },
});
</script>
