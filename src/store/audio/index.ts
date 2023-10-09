import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import { Store } from '..';
import { IMediaHandler } from '@/code/media/IMediaHandler';

/**
 *  Defining the AudioContext
 *  @devdoc webkitAudioContext supports older versions of Safari
 */
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext({
    latencyHint: 'interactive',
});
console.info('new audio context created');

/** A store for audio-related global state */
export const useAudioStore = defineStore(Store.Audio, () => {
    /** The audio context to use for the lifetime of the app instance
     * @devdoc Does get destroyed only after document unload, but this is good enough I guess.
     */
    const context = shallowRef(audioContext);

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
        if (context.value.state !== 'closed') {
            context.value.close();
            console.info('audio context is closed now');
        } else {
            console.info('audio context was already closed');
        }
    }

    //TODO useGesture instead of click handler
    /** Resumes the audio context, if it's suspended.
     * @remarks This should be called only on first user gesture, however an internal check prevents the audio context
     * from repeated resumption.
     */
    function resumeContext() {
        if (context.value.state === 'suspended') {
            context.value.resume().then(() => {
                console.info('audio context resumed');
            });
        }
    }

    return {
        context,
        mediaHandlers,
        addMediaHandler,
        removeMediaHandler,
        closeContext,
        resumeContext,
    };
});
