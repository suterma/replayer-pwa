<template>
    <div class="cue-buttons-bar buttons is-fullwidth is-flex-wrap-nowrap">
        <template v-for="cue in track.Cues" :key="cue.Id">
            <CueButton
                class="is-flex-grow-1 has-cropped-text"
                :cue="cue"
                :isTrackPlaying="isTrackPlaying"
                :playbackMode="playbackMode"
                :hasAddonsRight="true"
                :isMinified="true"
                :isCueSelected="isCueSelected(cue)"
                :hasCuePassed="hasCuePassed(cue)"
                :isCueAhead="isCueAhead(cue)"
                :percentComplete="percentComplete(cue)"
                @click="$emit('click', cue)"
            >
                <span class="has-text-weight-semibold foreground is-size-7">{{
                    cue?.Description
                }}</span>
            </CueButton>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ICue, PlaybackMode, Track } from '@/store/compilation-types';
import CueButton from '@/components/buttons/CueButton.vue';
 
/** A single line bar with simple cue buttons for a track
 */
export default defineComponent({
    name: 'CueButtonsBar',
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
        /* Determines whether playback of this cue has already passed */
        hasCuePassed(cue: ICue): boolean {
            if (this.currentSeconds !== undefined) {
                if (
                    cue &&
                    cue.Time !== null &&
                    cue.Duration !== null &&
                    Number.isFinite(cue.Time) &&
                    Number.isFinite(cue.Duration)
                ) {
                    return cue.Time + cue.Duration <= this.currentSeconds;
                }
            }
            return false;
        },
        /* Determines whether playback of this cue has not yet started */
        isCueAhead(cue: ICue): boolean {
            if (this.currentSeconds !== undefined) {
                if (cue && cue.Time !== null && Number.isFinite(cue.Time)) {
                    return this.currentSeconds < cue.Time;
                }
            }
            return false;
        },
        /** The playback progress within this cue, in [percent], or zero if not applicable */
        percentComplete(cue: ICue): number {
            if (this.currentSeconds !== undefined) {
                if (
                    cue &&
                    cue.Time !== null &&
                    cue.Duration !== null &&
                    Number.isFinite(cue.Time) &&
                    Number.isFinite(cue.Duration) &&
                    !this.isCueAhead(cue) &&
                    !this.hasCuePassed(cue)
                ) {
                    return (
                        (100 / cue.Duration) * (this.currentSeconds - cue.Time)
                    );
                }
            }
            return 0;
        },
    },
});
</script>

<style lang="scss">
.cue-buttons-bar.buttons {
    /** Use a very slim margin between the button in this buttons bar, to save space */
    .button:not(:last-child):not(.is-fullwidth) {
        margin-right: 2px;
    }

    /** Allow for slim buttons in this buttons bar, to save space */
    .player-timeline {
        min-width: 0;
    }

    /* For mobile, use super slim buttons in this buttons bar, to save space */
    @media screen and (max-width: 768px) {
        /** Define slim style for use specifically on mobile devices */
        .is-size-7 {
            font-size: xx-small !important;
        }

        .icon {
            display: none;
        }

        .button {
            line-height: normal !important;
        }
    }
}
</style>
