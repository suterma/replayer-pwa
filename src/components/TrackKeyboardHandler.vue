<template>
    <!-- eslint-disable-line -->
    <GlobalEvents
        @keyup.prevent.enter="togglePlayback"
        @keyup.prevent.space="togglePlayback"
        @keyup.prevent.left="backToCue"
        @keyup.prevent.-="volumeDown"
        @keyup.prevent.+="volumeUp"
        @keyup.prevent.0="backToCue"
    />
    <!-- page-down / page-up to navigate between tracks? -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TrackAudioPlayer from '@/components/TrackAudioPlayer.vue';
import { ICue, Track } from '@/store/compilation-types';
import { GlobalEvents } from 'vue-global-events';

/** A keyboard handler, which translates keyboard shortcuts into track audio player actions, for a single track
 * @remarks This handler does not check whether the track is the active one,
 * this must be handeled outside this handler, using a v-if clause for this component
 */
export default defineComponent({
    name: 'TrackKeyboardHandler',
    components: { GlobalEvents },
    props: {
        /** The player instance (of type TrackAudioPlayer) which is to be manipulated. */
        playerInstance: Object,
        track: {
            type: Track,
            default: null,
        },
    },
    computed: {
        /** For typing convenience, provides the player instance as instance of type TrackAudioPlayer */
        trackPlayerInstance(): InstanceType<typeof TrackAudioPlayer> {
            return this.playerInstance as InstanceType<typeof TrackAudioPlayer>;
        },
        selectedCue(): ICue {
            return this.$store.getters.selectedCue as ICue;
        },
    },

    watch: {},
    methods: {
        /** Toggles playback */
        togglePlayback() {
            this.trackPlayerInstance.togglePlayback();
        },
        /** Decreases the volume */
        volumeDown() {
            this.trackPlayerInstance.volumeDown();
        },
        /** Increases the volume */
        volumeUp() {
            this.trackPlayerInstance.volumeUp();
        },
        /** Seeks back to the temporal position of the currently selected cue */
        backToCue() {
            if (this.selectedCue?.Time) {
                this.trackPlayerInstance.pause();
                this.trackPlayerInstance.seekTo(this.selectedCue.Time);
            }
        },
    },
});
</script>
