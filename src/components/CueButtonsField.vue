<template>
    <div class="cue-buttons-field buttons is-fullwidth">
        <template v-for="cue in track.Cues" :key="cue.Id">
            <CueButton
                class="is-flex-grow-1"
                :cue="cue"
                :currentSeconds="currentSeconds"
                :isTrackPlaying="isTrackPlaying"
                :playbackMode="playbackMode"
                :hasAddonsRight="true"
                :isMinified="false"
                @click="$emit('click', cue)"
            >
                <!-- <span class="has-text-weight-semibold foreground is-size-7">{{
                    cue?.Description
                }}</span> -->
            </CueButton>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { PlaybackMode, Track } from '@/store/compilation-types';
import CueButton from '@/components/buttons/CueButton.vue';

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
        /** The playback mode
         * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
         */
        playbackMode: {
            type: String as () => PlaybackMode,
            required: true,
        },
    },
});
</script>

<style scoped>
/* Align all the buttons within a nice rectangular area */
.cue-buttons-field.buttons {
    margin-right: -0.5rem;
}

.cue-buttons-field.buttons button {
    margin-right: 0.5rem;
}

.cue-buttons-field.buttons:last-child {
    /* margin-bottom: -0.5rem; */
}
</style>
