import { defineStore } from 'pinia';
import { ShallowRef, computed, ref, shallowRef } from 'vue';
import { Store } from '..';
import { IMediaHandler } from '@/code/media/IMediaHandler';

/**
 *  Defining the AudioContext
 *  @devdoc webkitAudioContext supports older versions of Safari
 */
const AudioContext = window.AudioContext || window.webkitAudioContext;

/** A store for audio-related global state */
export const useAudioStore = defineStore(Store.Audio, () => {
    /** The audio context to use for the lifetime of the app instance
     * @devdoc Does get destroyed only after document unload, but this is good enough I guess.
     */
    const audioContext: ShallowRef<AudioContext | null> = shallowRef(null);

    /** The media handlers the application can work with
     * @remarks Each media handler belongs to a track in the compilation
     */

    const mediaHandlers = ref(new Array<IMediaHandler>());

    /** Adds the given media handler to the list of available media handlers */
    function addMediaHandler(handler: IMediaHandler) {
        mediaHandlers.value.push(handler);
    }
    /** Removes the given media handler from the list of available media handler, by the id attribute */
    function removeMediaHandlerById(handlerId: string) {
        const removeIndex = mediaHandlers.value
            .map((handler) => handler.id)
            .indexOf(handlerId);

        ~removeIndex && mediaHandlers.value.splice(removeIndex, 1);
    }

    /** Removes the given media handler from the list of available media handler */
    function removeMediaHandler(handler: IMediaHandler) {
        removeMediaHandlerById(handler.id);
    }

    /** Closes the audio context.
     * @remarks This should be called when this store is not used anymore, for example at teardown of the app.
     */
    function closeContext() {
        if (audioContext.value) {
            if (audioContext.value.state !== 'closed') {
                audioContext.value.close();
                console.info('audio context is closed now');
            } else {
                console.info('audio context was already closed');
            }
        }
    }

    /** Creates and resumes the audio context, if it's suspended.
     * @remarks This should be called only on first user gesture, however an internal check prevents the audio context
     * from repeated creation and resumption.
     */
    function resumeContext() {
        createContext();
        if (audioContext.value) {
            if (audioContext.value.state === 'suspended') {
                audioContext.value.resume().then(() => {
                    console.info('audio context resumed');
                });
            }
        }
    }

    /** Creates the audio context, if it's not alredy created.
     */
    function createContext() {
        if (audioContext.value === null) {
            console.info('audio context created');
            audioContext.value = new AudioContext({
                latencyHint: 'interactive',
            });
        }
    }

    const context = computed(() => {
        return audioContext.value;
    });

    return {
        context,
        mediaHandlers,
        addMediaHandler,
        removeMediaHandler,
        closeContext,
        resumeContext,
    };
});
