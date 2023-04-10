import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';

/**
 *  Defining the AudioContext
 *  @devdoc webkitAudioContext supports older versions of Safari
 */
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
console.info('new audio context created');

/** A store for audio-related global state */
export const useAudioStore = defineStore('audio', () => {
    /** The audio context to use for the lifetime of the app instance
     * @devdoc Does get destroyed only after document unload, but this is good enough I guess.
     */
    const context = shallowRef(audioContext);

    /** The media elements the application can work with
     * @remarks Each media element belongs to a track in the compilation
     */

    const mediaElements = ref(new Array<HTMLMediaElement>());

    /** Adds the given media element to the list of available media elements */
    function addMediaElement(element: HTMLMediaElement) {
        mediaElements.value.push(element);
    }
    /** Removes the given media element from the list of available media elements, by the id attribute */
    function removeMediaElement(element: HTMLMediaElement) {
        const removeElementId = element.id;
        const removeIndex = mediaElements.value
            .map((element) => element.id)
            .indexOf(removeElementId);

        ~removeIndex && mediaElements.value.splice(removeIndex, 1);
    }

    /** Closes the audio context.
     * @remarks This should be called when this store is not used anymore, for example at teardown of the app.
     */
    function closeContext() {
        context.value.close();
        console.info('audio context closed');
    }

    return {
        context,
        mediaElements,
        addMediaElement,
        removeMediaElement,
        closeContext,
    };
});
