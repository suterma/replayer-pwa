import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

const AudioContext = window.AudioContext;
const audioContext = new AudioContext();

/** A store for audio-related global state */
export const useAudioStore = defineStore('audio', () => {
    /** The audio context to use for the lifetime of the app instance
     * @devdoc Does get destroyed only after document unload, but this is good enough I guess.
     */
    const context = shallowRef(audioContext);
    return { context };
});
