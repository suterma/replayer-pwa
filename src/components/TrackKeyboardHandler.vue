<template></template>

<script lang="ts">
import { MutationTypes } from '@/store/mutation-types';
import { defineComponent } from 'vue';
import TrackAudioPlayer from '@/components/TrackAudioPlayer.vue';
import { Track } from '@/store/compilation-types';

/** A keyboard handler, which translates keyboard shortcuts into track audio player actions, for a single track
 */
export default defineComponent({
    name: 'TrackKeyboardHandler',
    components: { TrackAudioPlayer },
    props: {
        playerInstance: {
            type: TrackAudioPlayer,
            default: null,
        },
        track: {
            type: Track,
            default: null,
        },
    },
    data: () => ({}),
    computed: {},

    watch: {},
    methods: {
        stop() {
            this.playing = false;
            (this.$refs.audio as InstanceType<typeof Audio>).currentTime = 0;
            this.$store.commit(MutationTypes.UPDATE_CURRENT_CUE, undefined);
        },
        togglePlayback() {
            this.playing = !this.playing;
        },
        volumeDown() {
            this.volume = this.volume * 0.71;
        },
        volumeUp() {
            this.volume = Math.min(this.volume * 1.41, 100);
        },
        /** Pauses playback, keeping the position at the current position */
        pause() {
            this.playing = false;
        },
        /** Updates the current seconds display and emits an event with the temporal position of the player
         * @devdoc This must get only privately called from the audio player
         */
        updateTime(e: Event) {
            this.currentSeconds = (
                e.target as InstanceType<typeof Audio>
            ).currentTime;

            this.$emit('timeupdate', this.currentSeconds);
        },
        /** Starts playback from the given temporal position */
        playFrom(position: number): void {
            this.seekTo(position);
            this.playing = true;
        },
        /** Transports (seeks) the playback to the given temporal position */
        seekTo(position: number): void {
            (this.$refs.audio as InstanceType<typeof Audio>).currentTime =
                position;
        },
    },
});
</script>
<style scoped></style>
