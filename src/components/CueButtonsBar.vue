<template>
    <div class="buttons is-fullwidth is-flex-wrap-nowrap">
        <!-- NOTE: For performance reasons, maybe evaluate the use for isMobile() from the TimeDisplay component -->
        <template v-for="cue in track.Cues" :key="cue.Id">
            <!-- For mobile, use very slim buttons -->
            <CueButton
                class="is-flex-grow-1 has-cropped-text is-hidden-tablet"
                :cue="cue"
                :currentSeconds="currentSeconds"
                :isTrackPlaying="isTrackPlaying"
                :hasAddonsRight="true"
                :isMinified="true"
                @click="$emit('click', cue)"
            >
                <span class="has-text-weight-semibold foreground is-size-7">{{
                    cue?.Description
                }}</span>
            </CueButton>
            <!-- Otherwise, use standard buttons -->
            <CueButton
                class="is-flex-grow-1 has-cropped-text is-hidden-mobile"
                :cue="cue"
                :currentSeconds="currentSeconds"
                :isTrackPlaying="isTrackPlaying"
                :hasAddonsRight="true"
                :isMinified="true"
                @click="$emit('click', cue)"
            >
                <span class="has-text-weight-semibold foreground is-size-7">{{
                    cue?.Description
                }}</span>
            </CueButton>
        </template>

        <!-- <template v-for="cue in track.Cues" :key="cue.Id">
            <CueButton
                class="is-flex-grow-1 has-cropped-text"
                :cue="cue"
                :currentSeconds="currentSeconds"
                :isTrackPlaying="isTrackPlaying"
                :hasAddonsRight="true"
                :isMinified="true"
                @click="$emit('click', cue)"
            >
                <span class="has-text-weight-semibold foreground is-size-7">{{
                    cue?.Description
                }}</span>
            </CueButton>
        </template> -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track } from '@/store/compilation-types';
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
    },
});
</script>

<style lang="css">
/** Use a very slim margin between the button in this buttons bar, to save space */
.buttons .button:not(:last-child):not(.is-fullwidth) {
    margin-right: 2px;
}
.player-timeline {
     min-width: 0; 
}

/** Optically minimize padding. The used icon already has some visual padding already. */
.button.cue {
  /* padding-left: 2px; */
}


/** Define slim style for use specifically on mobile devices */
.is-hidden-tablet .is-size-7 {
    font-size: xx-small  !important;
}

.is-hidden-tablet .icon {
    display: none;
}

.is-hidden-tablet.button {
    line-height: normal !important;
}

</style>
