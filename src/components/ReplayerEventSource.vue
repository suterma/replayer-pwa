<template>
    <div>
        <!-- ReplayerEventSource -->
        <!-- this should get removed, but empty templates are not allowed -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ReplayerEvent } from '@/code/ui/ReplayerEvent';

/** An event source for Replayer events.
 * @remarks Registers/Deregisters to the global Replayer events and emits them as Vue events to the parent component.
 * @privateRemarks Implements the 'Separation of Concern' pattern for the Replayer global events, allowing a parent component
 * to simply use the @ shortcut to register for these events.
 * @privateRemarks This component handles registering and deregistering the events internally
 */
export default defineComponent({
    name: 'ReplayerEventSource',
    emits: [
        ReplayerEvent.BACK_TO_CUE,
        ReplayerEvent.TO_NEXT_CUE,
        ReplayerEvent.TO_PREV_CUE,
        ReplayerEvent.TO_MNEMONIC_CUE,
        ReplayerEvent.PLAY,
        ReplayerEvent.PAUSE,
        ReplayerEvent.TOGGLE_PLAYBACK,
        ReplayerEvent.REWIND,
        ReplayerEvent.FORWARD,
        ReplayerEvent.VOLUME_DOWN,
        ReplayerEvent.VOLUME_UP,
    ],
    mounted: function (): void {
        //Register to the global events
        window.addEventListener(ReplayerEvent.BACK_TO_CUE, this.backToCue);
        window.addEventListener(ReplayerEvent.TO_NEXT_CUE, this.toNextCue);
        window.addEventListener(
            ReplayerEvent.TO_PREV_CUE,
            this.toPreviousCue,
        );
        window.addEventListener(
            ReplayerEvent.TO_MNEMONIC_CUE,
            this.toMnemonicCue,
        );
        window.addEventListener(
            ReplayerEvent.PLAY,
            this.play,
        );
        window.addEventListener(
            ReplayerEvent.PAUSE,
            this.pause,
        );
        window.addEventListener(
            ReplayerEvent.TOGGLE_PLAYBACK,
            this.togglePlayback,
        );
        window.addEventListener(ReplayerEvent.REWIND, this.rewindFiveSeconds);
        window.addEventListener(
            ReplayerEvent.FORWARD,
            this.forwardFiveSeconds,
        );
        window.addEventListener(ReplayerEvent.VOLUME_DOWN, this.volumeDown);
        window.addEventListener(ReplayerEvent.VOLUME_UP, this.volumeUp);
    },
    unmounted: function (): void {
        //Deregister from the global events
        window.removeEventListener(ReplayerEvent.BACK_TO_CUE, this.backToCue);
        window.removeEventListener(ReplayerEvent.TO_NEXT_CUE, this.toNextCue);
        window.removeEventListener(
            ReplayerEvent.TO_PREV_CUE,
            this.toPreviousCue,
        );
        window.removeEventListener(
            ReplayerEvent.TO_MNEMONIC_CUE,
            this.toMnemonicCue,
        );
        window.removeEventListener(
            ReplayerEvent.TOGGLE_PLAYBACK,
            this.togglePlayback,
        );
        window.removeEventListener(
            ReplayerEvent.REWIND,
            this.rewindFiveSeconds,
        );
        window.removeEventListener(
            ReplayerEvent.FORWARD,
            this.forwardFiveSeconds,
        );
        window.removeEventListener(
            ReplayerEvent.VOLUME_DOWN,
            this.volumeDown,
        );
        window.removeEventListener(ReplayerEvent.VOLUME_UP, this.volumeUp);
    },
    methods: {
        //The functions for registration
        play(event: Event) {
            this.$emit(ReplayerEvent.PLAY, event);
        },
        pause(event: Event) {
            this.$emit(ReplayerEvent.PAUSE, event);
        },
        togglePlayback(event: Event) {
            this.$emit(ReplayerEvent.TOGGLE_PLAYBACK, event);
        },
        rewindFiveSeconds(event: Event) {
            this.$emit(ReplayerEvent.REWIND, event);
        },
        forwardFiveSeconds() {
            this.$emit(ReplayerEvent.FORWARD, event);
        },
        volumeDown(event: Event) {
            this.$emit(ReplayerEvent.VOLUME_DOWN, event);
        },
        volumeUp(event: Event) {
            this.$emit(ReplayerEvent.VOLUME_UP, event);
        },
        backToCue(event: Event) {
            this.$emit(ReplayerEvent.BACK_TO_CUE, event);
        },
        toNextCue(event: Event) {
            this.$emit(ReplayerEvent.TO_NEXT_CUE, event);
        },
        toPreviousCue(event: Event) {
            this.$emit(ReplayerEvent.TO_PREV_CUE, event);
        },
        toMnemonicCue(event: Event) {
            this.$emit(ReplayerEvent.TO_MNEMONIC_CUE, event);
        },
    },
});
</script>
