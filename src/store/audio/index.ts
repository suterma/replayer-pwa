import { defineStore } from 'pinia';
import { type ShallowRef, computed, ref, shallowRef, readonly } from 'vue';
import { Store } from '..';
import type { IMediaHandler } from '@/code/media/IMediaHandler';

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

    /** Internal flag, whether the audio context currently can be considered as running. */
    const isContextRunningFlag = shallowRef(false);

    /** Readonly flag, whether the audio context currently can be considered as running. */
    const isContextRunning = readonly(isContextRunningFlag);

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
            isContextRunningFlag.value = false;
            if (audioContext.value.state !== 'closed') {
                audioContext.value.close();
                console.info('AudioContext is closed now');
            } else {
                console.info('AudioContext was already closed');
            }
        }
    }

    /** Creates and resumes the audio context, if it's not yet running.
     * @remarks This needs to be called only on first user gesture, however an internal check prevents the audio context
     * from repeated creation and resumption.
     */
    function resumeContext() {
        if (!isContextRunningFlag.value) {
            createContext();
            if (audioContext.value) {
                if (audioContext.value.state === 'running') {
                    reportRunningAudioContext();
                } else {
                    console.info('AudioContext resuming...');
                    audioContext.value.resume().then(() => {
                        reportRunningAudioContext();
                    });
                }
            }
        }
    }

    function reportRunningAudioContext() {
        isContextRunningFlag.value = true;
        console.info('AudioContext running');

        // Write additional info. Cast to any is necessary,
        // as the type does not know about these properties
        console.info(
            'AudioContext base latency: ' +
                // eslint-disable-next-line
                (audioContext.value as any)?.baseLatency +
                'sec',
        );
        console.info(
            'AudioContext output latency: ' +
                // eslint-disable-next-line
                (audioContext.value as any)?.outputLatency +
                'sec',
        );
    }

    /** Creates the audio context, if it's not alredy created.
     */
    function createContext() {
        if (audioContext.value === null) {
            audioContext.value = new AudioContext({
                latencyHint: 'interactive',
            });
            console.info('AudioContext created');
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
        isContextRunning,
    };
});
