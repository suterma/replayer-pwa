<template>
    <div class="buttons is-fullwidth is-flex-wrap-nowrap">
        <template v-for="cue in track.Cues" :key="cue.Id">
            <CueButton
                class="is-flex-grow-1 long-and-truncated"
                :cue="cue"
                :currentSeconds="currentSeconds"
                :isTrackPlaying="isTrackPlaying"
                :hasAddonsRight="true"
                :isMinified="true"
                @click="$emit('click', cue)"
            >
                &nbsp;
                <span class="has-text-weight-semibold foreground is-size-7">{{
                    cue?.Description
                }}</span></CueButton
            >
        </template>
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
<style lang="scss" scoped>
/** Taken from https://css-tricks.com/flexbox-truncated-text/#comment-1601483 by Larry Gordon */
.long-and-truncated {
    flex: 1;
    &,
    & > * {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
</style>
