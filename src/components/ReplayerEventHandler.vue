<template>
    <div />
    <!-- this should get removed, but empty templates are not allowed -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Replayer } from '@/components/CompilationKeyboardHandler.vue';

/** An event handler for Replayer events.
 * @remarks Registers/Deregisters to the global Replayer events and emits them as Vue events to the parent component.
 * @devdoc Implements the 'Separation of Concern' pattern for the Replayer global events, allowing a parent component
 * to simply use the @ shortcut to register for these events.
 * @devdoc This component handles registering and deregistering the events internally
 */
export default defineComponent({
    name: 'ReplayerEventHandler',
    emits: [
        Replayer.BACK_TO_CUE,
        Replayer.TO_NEXT_CUE,
        Replayer.TO_PREV_CUE,
        Replayer.TO_MNEMONIC_CUE,
        Replayer.TOGGLE_PLAYBACK,
        Replayer.REWIND,
        Replayer.FORWARD,
        Replayer.VOLUME_DOWN,
        Replayer.VOLUME_UP,
    ],
    mounted: function (): void {
        //Register to the global events
        document.addEventListener(Replayer.BACK_TO_CUE, this.backToCue);
        document.addEventListener(Replayer.TO_NEXT_CUE, this.toNextCue);
        document.addEventListener(Replayer.TO_PREV_CUE, this.toPreviousCue);
        document.addEventListener(Replayer.TO_MNEMONIC_CUE, this.toMnemonicCue);
        document.addEventListener(
            Replayer.TOGGLE_PLAYBACK,
            this.togglePlayback,
        );
        document.addEventListener(Replayer.REWIND, this.rewindFiveSeconds);
        document.addEventListener(Replayer.FORWARD, this.forwardFiveSeconds);
        document.addEventListener(Replayer.VOLUME_DOWN, this.volumeDown);
        document.addEventListener(Replayer.VOLUME_UP, this.volumeUp);
    },
    unmounted: function (): void {
        //Deregister from the global events
        document.removeEventListener(Replayer.BACK_TO_CUE, this.backToCue);
        document.removeEventListener(Replayer.TO_NEXT_CUE, this.toNextCue);
        document.removeEventListener(Replayer.TO_PREV_CUE, this.toPreviousCue);
        document.removeEventListener(
            Replayer.TO_MNEMONIC_CUE,
            this.toMnemonicCue,
        );
        document.removeEventListener(
            Replayer.TOGGLE_PLAYBACK,
            this.togglePlayback,
        );
        document.removeEventListener(Replayer.REWIND, this.rewindFiveSeconds);
        document.removeEventListener(Replayer.FORWARD, this.forwardFiveSeconds);
        document.removeEventListener(Replayer.VOLUME_DOWN, this.volumeDown);
        document.removeEventListener(Replayer.VOLUME_UP, this.volumeUp);
    },
    methods: {
        //The functions for registration
        togglePlayback(event: Event) {
            this.$emit(Replayer.TOGGLE_PLAYBACK, event);
        },
        rewindFiveSeconds(event: Event) {
            this.$emit(Replayer.REWIND, event);
        },
        forwardFiveSeconds() {
            this.$emit(Replayer.FORWARD, event);
        },
        volumeDown(event: Event) {
            this.$emit(Replayer.VOLUME_DOWN, event);
        },
        volumeUp(event: Event) {
            this.$emit(Replayer.VOLUME_UP, event);
        },
        backToCue(event: Event) {
            this.$emit(Replayer.BACK_TO_CUE, event);
        },
        toNextCue(event: Event) {
            this.$emit(Replayer.TO_NEXT_CUE, event);
        },
        toPreviousCue(event: Event) {
            this.$emit(Replayer.TO_PREV_CUE, event);
        },
        toMnemonicCue(event: Event) {
            this.$emit(Replayer.TO_MNEMONIC_CUE, event);
        },
    },
});
</script>
