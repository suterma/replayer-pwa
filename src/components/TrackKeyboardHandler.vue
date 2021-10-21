<template>
    <!-- eslint-disable-line -->
    <!-- Note: See for keyboard events in javascript: https://www.section.io/engineering-education/keyboard-events-in-javascript/ -->
    <!-- <GlobalEvents
        @keydown.prevent.enter="togglePlayback"
        @keydown.prevent.space="togglePlayback"
        @keydown.prevent.-="volumeDown"
        @keydown.prevent.+="volumeUp"
        @keydown.prevent.left="rewind"
        @keydown.prevent.right="forward"
        @keydown.prevent="handleKey"
    /> -->

    //TODO expand the compilation keyboard handle to all these events, then
    handle these here, including the play/pause and the "back to cue" after a
    mnemonic based cue change

    <!-- <GlobalEvents
        @keydown.prevent.space="togglePlayback"
        @keydown.prevent.-="volumeDown"
        @keydown.prevent.+="volumeUp"
        @keydown.prevent.left="rewind"
        @keydown.prevent.right="forward"
        @keydown.prevent="handleKey"
    /> -->
    <KeyResponseOverlay :keyText="key" ref="keyResponseOverlay" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TrackAudioPlayer from '@/components/TrackAudioPlayer.vue';
import KeyResponseOverlay from '@/components/KeyResponseOverlay.vue';
import { ICue, Track } from '@/store/compilation-types';
//import { GlobalEvents } from 'vue-global-events';

/** A keyboard handler, which translates keyboard shortcuts into track audio player actions, for a single track
 * @remarks This handler does not check whether the track is the active one,
 * this must be handeled outside this handler, using a v-if clause for this component
 */
export default defineComponent({
    name: 'TrackKeyboardHandler',
    components: { KeyResponseOverlay },
    props: {
        /** The player instance (of type TrackAudioPlayer) which is to be manipulated. */
        playerInstance: null,
        track: {
            type: Track,
            default: null,
        },
    },
    data() {
        return {
            /** The character representation of the currently pressed key (or keys, when handling  a shortcut) */
            key: '',
        };
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
        togglePlayback(event: KeyboardEvent) {
            this.DisplayKeyAndAction(event, 'play/pause');
            this.trackPlayerInstance.togglePlayback();
        },
        /** Rewinds 1 second */
        rewind(event: KeyboardEvent) {
            this.DisplayKeyAndAction(event, 'rewind 1 sec');
            this.trackPlayerInstance.rewindOneSecond();
        },
        /** Forwards 1 second */
        forward(event: KeyboardEvent) {
            this.DisplayKeyAndAction(event, 'forward 1 sec');
            this.trackPlayerInstance.forwardOneSecond();
        } /** Decreases the volume */,
        volumeDown(event: KeyboardEvent) {
            this.DisplayKeyAndAction(event, 'volume down');
            this.trackPlayerInstance.volumeDown();
        },
        /** Increases the volume */
        volumeUp(event: KeyboardEvent) {
            this.DisplayKeyAndAction(event, 'volume up');
            this.trackPlayerInstance.volumeUp();
        },
        /** Generally handle all key events, by checking for recognisable events
         * @remarks Handles "back to cue" and "keyboard shortcut scan" events
         */
        handleKey(event: KeyboardEvent) {
            //Back to cue (dot)?
            if (event.code === 'NumpadDecimal' || event.code === 'Period') {
                this.DisplayKeyAndAction(event, 'back to cue');
                this.backToCue();
            }
            //Next/previous cue?
            //Hint: calculation and handling of the cue is done at the compilation level,
            //but playback should pause on cue change, which is best handeled here
            //By luck(?), the selected cue is already correct and can simply get handeled with a "back to cue" here
            if (
                event.code === 'NumpadMultiply' ||
                event.code === 'NumpadDivide'
            ) {
                this.backToCue();
            }
        },
        /** Seeks back to the temporal position of the currently selected cue
         * @remarks This filters to the dot key
         */
        backToCue() {
            console.debug(
                'TrackKeyboardHandler::backToCue:this.selectedCue',
                this.selectedCue,
            );
            if (this.selectedCue?.Time != null) {
                this.trackPlayerInstance.pause();
                this.trackPlayerInstance.seekTo(this.selectedCue.Time);
            }
        },

        /** Displays the given key and the associated action for a short duration */
        DisplayKeyAndAction(event: KeyboardEvent, action: string) {
            let eventKey = event.key;
            if (eventKey == ' ') {
                eventKey = 'Space';
            }

            (
                this.$refs.keyResponseOverlay as InstanceType<
                    typeof KeyResponseOverlay
                >
            ).DisplayDataAndAction(eventKey, action);
        },
    },
});
</script>
