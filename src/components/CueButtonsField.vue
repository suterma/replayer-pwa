<template>
    <div class="buttons has-gap is-fullwidth">
        <!-- A virtual cue button as prefix, when the first cue is not at the zero position -->
        <CueButton
            v-if="prefixCue.Duration ?? 0 > 0"
            class="is-flex-grow-1"
            :disabled="disabled || !Number.isFinite(prefixCue.Time)"
            :time="prefixCue.Time"
            :shortcut="prefixCue.Shortcut"
            :duration="prefixCue.Duration"
            :description="prefixCue.Description"
            :isTrackPlaying="isTrackPlaying"
            :playbackMode="playbackMode"
            hasAddonsRight
            virtual
            :isCueSelected="isCueSelected(prefixCue)"
            :hasCuePassed="hasCuePassed(prefixCue)"
            :isCueAhead="isCueAhead(prefixCue)"
            :percentComplete="percentComplete(prefixCue)"
            @click="$emit('click', prefixCue)"
        >
        </CueButton>
        <template v-for="cue in track.Cues" :key="cue.Id">
            <CueButton
                class="is-flex-grow-1"
                :disabled="disabled || !Number.isFinite(cue.Time)"
                :time="cue.Time"
                :shortcut="cue.Shortcut"
                :duration="cue.Duration"
                :description="cue.Description"
                :isTrackPlaying="isTrackPlaying"
                :playbackMode="playbackMode"
                hasAddonsRight
                :isCueSelected="isCueSelected(cue)"
                :hasCuePassed="hasCuePassed(cue)"
                :isCueAhead="isCueAhead(cue)"
                :percentComplete="percentComplete(cue)"
                @click="$emit('click', cue)"
            >
            </CueButton>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Cue, ICue, PlaybackMode, Track } from '@/store/compilation-types';
import CueButton from '@/components/buttons/CueButton.vue';
import CompilationHandler from '@/store/compilation-handler';

/** A field of large cue buttons for a track
 */
export default defineComponent({
    name: 'CueButtonsField',
    components: { CueButton },
    emits: ['click'],
    props: {
        /** The playback progress in the current track, in [seconds]
         * @remarks This is used for progress display within the set of cues
         */
        currentSeconds: Number,

        /** The track to show cues for
         */
        track: {
            type: Track,
            required: true,
        },
        /** Indicates whether the associated Track is currently playing
         * @remarks This is used to depict the expected action on button press. While playing, this is pause, and vice versa.
         */
        isTrackPlaying: Boolean,
        /** Whether to show the component in a disabled state
         * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
         */
        disabled: Boolean,
        /** The playback mode
         * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
         */
        playbackMode: {
            type: String as () => PlaybackMode,
            required: true,
        },
    },
    methods: {
        /** Determines whether this cue is currently selected
         * @remarks Note: only one cue in a compilation may be selected */
        isCueSelected(cue: ICue): boolean {
            return this.$store.getters.selectedCueId == cue.Id;
        },
        /** Determines whether playback of the given cue has already passed
         * @remarks Is used for visual indication of playback progress
         * @param cue - the cue to determine the playback progress for
         */
        hasCuePassed(cue: ICue): boolean {
            return CompilationHandler.hasCuePassed(cue, this.currentSeconds);
        },
        /** Determines whether playback of this cue has not yet started
         * @param cue - the cue to determine the playback progress for
         */
        isCueAhead(cue: ICue): boolean {
            return CompilationHandler.isCueAhead(cue, this.currentSeconds);
        },
        /** The playback progress within this cue, in [percent], or null if not applicable
         * @param cue - the cue to determine the playback progress for
         */
        percentComplete(cue: ICue): number | null {
            return CompilationHandler.percentComplete(cue, this.currentSeconds);
        },
    },
    computed: {
        prefixCue(): ICue {
            return new Cue(
                'the Beginning',
                '',
                0,
                this.track.Cues[0]?.Time ?? null,
                '',
            );
        },
    },
});
</script>
