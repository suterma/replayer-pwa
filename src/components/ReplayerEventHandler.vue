<template>
    <div>
        <!-- ReplayerEventHandler -->
        <!-- this should get removed, but empty templates are not allowed -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ReplayerEvent } from '@/code/ui/ReplayerEvent';

/** An event handler for Replayer events.
 * @remarks Registers/Deregisters to the global Replayer events and emits them as Vue events to the parent component.
 * @devdoc Implements the 'Separation of Concern' pattern for the Replayer global events, allowing a parent component
 * to simply use the @ shortcut to register for these events.
 * @devdoc This component handles registering and deregistering the events internally
 */
export default defineComponent({
    name: 'ReplayerEventHandler',
    emits: [
        ReplayerEvent.BACK_TO_CUE,
        ReplayerEvent.TO_NEXT_CUE,
        ReplayerEvent.TO_PREV_CUE,
        ReplayerEvent.TO_MNEMONIC_CUE,
        ReplayerEvent.TOGGLE_PLAYBACK,
        ReplayerEvent.REWIND,
        ReplayerEvent.FORWARD,
        ReplayerEvent.VOLUME_DOWN,
        ReplayerEvent.VOLUME_UP,
        ReplayerEvent.CLEAN_UP,
    ],
    mounted: function (): void {
        //Register to the global events
        document.addEventListener(ReplayerEvent.BACK_TO_CUE, this.backToCue);
        document.addEventListener(ReplayerEvent.TO_NEXT_CUE, this.toNextCue);
        document.addEventListener(
            ReplayerEvent.TO_PREV_CUE,
            this.toPreviousCue,
        );
        document.addEventListener(
            ReplayerEvent.TO_MNEMONIC_CUE,
            this.toMnemonicCue,
        );
        document.addEventListener(
            ReplayerEvent.TOGGLE_PLAYBACK,
            this.togglePlayback,
        );
        document.addEventListener(ReplayerEvent.REWIND, this.rewindFiveSeconds);
        document.addEventListener(
            ReplayerEvent.FORWARD,
            this.forwardFiveSeconds,
        );
        document.addEventListener(ReplayerEvent.VOLUME_DOWN, this.volumeDown);
        document.addEventListener(ReplayerEvent.VOLUME_UP, this.volumeUp);
        document.addEventListener(ReplayerEvent.CLEAN_UP, this.cleanup);
    },
    unmounted: function (): void {
        //Deregister from the global events
        document.removeEventListener(ReplayerEvent.BACK_TO_CUE, this.backToCue);
        document.removeEventListener(ReplayerEvent.TO_NEXT_CUE, this.toNextCue);
        document.removeEventListener(
            ReplayerEvent.TO_PREV_CUE,
            this.toPreviousCue,
        );
        document.removeEventListener(
            ReplayerEvent.TO_MNEMONIC_CUE,
            this.toMnemonicCue,
        );
        document.removeEventListener(
            ReplayerEvent.TOGGLE_PLAYBACK,
            this.togglePlayback,
        );
        document.removeEventListener(
            ReplayerEvent.REWIND,
            this.rewindFiveSeconds,
        );
        document.removeEventListener(
            ReplayerEvent.FORWARD,
            this.forwardFiveSeconds,
        );
        document.removeEventListener(
            ReplayerEvent.VOLUME_DOWN,
            this.volumeDown,
        );
        document.removeEventListener(ReplayerEvent.VOLUME_UP, this.volumeUp);
        document.removeEventListener(ReplayerEvent.CLEAN_UP, this.cleanup);
    },
    methods: {
        //The functions for registration
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
        cleanup(event: Event) {
            this.$emit(ReplayerEvent.CLEAN_UP, event);
        },
    },
});
</script>
