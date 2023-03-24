import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

const AudioContext = window.AudioContext;
const audioContext = new AudioContext();

/** A store for audio-related global state */
export const useAudioStore = defineStore('audio', () => {
    const context = shallowRef(audioContext);
    return { context };
});
