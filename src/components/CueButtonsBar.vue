<template>
    <div class="cue-buttons-bar buttons is-fullwidth is-flex-wrap-nowrap">
        <!-- A virtual cue button as prefix, when the first cue is not at the zero position -->
        <!-- Note: Do not crop the (non-existing) text in virtual cue buttons
             Also, leave the existing flex-grow, to allow them to fill single lines, but allow to shrink -->
        <CueButton
            v-if="prefixCue.Duration ?? 0 > 0"
            class="is-flex-grow-1 is-flex-shrink-5"
            :disabled="disabled || !Number.isFinite(prefixCue.Time)"
            :time="prefixCue.Time"
            :shortcut="prefixCue.Shortcut"
            :duration="prefixCue.Duration"
            :description="prefixCue.Description"
            :isTrackPlaying="isTrackPlaying"
            :playbackMode="playbackMode"
            hasAddonsRight
            minified
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
                class="is-flex-grow-1 has-cropped-text"
                :time="cue.Time"
                :shortcut="cue.Shortcut"
                :duration="cue.Duration"
                :description="cue.Description"
                :disabled="disabled || !Number.isFinite(cue.Time)"
                :isTrackPlaying="isTrackPlaying"
                :playbackMode="playbackMode"
                hasAddonsRight
                minified
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
import { Cue, ICue, PlaybackMode, Track } from '@/store/compilation-types';
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
        /** Whether to show the component in a disabled state
         * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
         */
        disabled: Boolean,
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
        /** The playback progress within this cue, in [percent], or null if not applicable
         * @devdoc //TODO move all those calculation methods, from 3 components,  for the cues to a central class
         */
        percentComplete(cue: ICue): number | null {
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
                return null;
            }
            return null;
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

    /* Virtual buttons should take up not unnecessary much space */
    .cue.button.is-virtual {
        max-width: 16em;
        /* do not shrink below the used icon width*/
        min-width: 34px;
    }
}
</style>
