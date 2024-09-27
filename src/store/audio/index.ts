/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

import { defineStore } from 'pinia';
import {
    type ShallowRef,
    shallowRef,
    readonly,
    shallowReactive,
    shallowReadonly,
} from 'vue';
import { Store } from '..';
import type { IMediaHandler } from '@/code/media/IMediaHandler';
import Constants from '@/code/media/Constants';

/**
 *  Defining the AudioContext
 *  @devdoc webkitAudioContext supports older versions of Safari
 */
const AudioContext = window.AudioContext || window.webkitAudioContext;

/** A store for audio-related global state. Maintains the Web Audio API context
 * and the set of IMediaHandlers for each media source in Replayer
 * @remarks Multiple tracks can refer to the same media source and thus to
 * the same handler. */
export const useAudioStore = defineStore(Store.Audio, () => {
    /** The audio context to use for the lifetime of the app instance
     * @devdoc Does get destroyed only after document unload, but this is good enough I guess.
     */
    const audioContext: ShallowRef<AudioContext | null> = shallowRef(null);

    /** The media handlers the application can work with
     * @remarks Each media handler belongs to a media source in the compilation
     * @devdoc It's not necessary to have the handlers themselves reactive, thus the
     * set is only shallow reactive
     */
    const mediaHandlers = shallowReactive(new Set<IMediaHandler>());

    /** The exposed, readonly media handlers the application can work with
     * @remarks Each media handler belongs to a media source in the compilation
     */
    const readonlyMediaHandlers = shallowReadonly(mediaHandlers);

    /** Internal flag, whether the audio context currently can be considered as running. */
    const isContextRunningFlag = shallowRef(false);

    /** Readonly flag, whether the audio context currently can be considered as running. */
    const isContextRunning = readonly(isContextRunningFlag);

    /** Adds the given media handler to the set of available media handlers
     * @remarks Handlers need to have a unique id, which is used to identify the
     * internal set entry.
     * NOTE: The id refers to a media source, thus a redundant entry, by id, would be a
     * duplicated handler for the same media source. A possibly already exsting handler
     * with the same id is destroyed and removed before the new handler is added.
     */
    function addMediaHandler(handler: IMediaHandler) {
        console.debug(
            'Store ' + Store.Audio + '::addMediaHandler:id:' + handler.id,
        );
        // find and possibly remove pre-existing handler for the same media source
        const existingHandler = [...mediaHandlers].find(
            (h) => h.id == handler.id,
        );
        if (existingHandler) {
            removeMediaHandler(existingHandler);
        }

        mediaHandlers.add(handler);
    }

    /** Removes the given media handler from the set of available media handlers
     * @remarks internally uses the handler id to identify the internal set entry
     */
    function removeMediaHandler(handler: IMediaHandler) {
        console.debug(
            'Store ' + Store.Audio + '::removeMediaHandler:id:' + handler.id,
        );
        handler.destroy();
        mediaHandlers.delete(handler);
    }

    //TODO expose this and consume from withing the mediaActions
    /** Gets the matching handler, if any, by it's media source.
     * @param url - The media URL
     * */
    // function getMediaHandlerByUrl(url: string): IMediaHandler | undefined {
    //     const trackMediaHandlerId = 'handler-' + url;
    //     const existingHandler = [...mediaHandlers].find(
    //         (h) => h.id == trackMediaHandlerId,
    //     ) as IMediaHandler;
    //     return existingHandler;
    // }

    //TODO expose this and consume from withing the mediaActions
    /** Gets the matching handler, if any, using the track id.
     * @param trackId - The Id of the track, whole media handler should be returned
     * */
    function getMediaHandlerByTrackId(
        trackId: string,
    ): IMediaHandler | undefined {
        const trackMediaHandlerId = `${Constants.HANDLER_ID_PREFIX}${Constants.MEDIATRACK_ID_PREFIX}${trackId}`;
        const existingHandler = [...mediaHandlers].find(
            (h) => h.id == trackMediaHandlerId,
        ) as IMediaHandler;
        return existingHandler;
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

    return {
        audioContext,
        /** The set of media handlers
         * @remarks Externally exposing the media handler set as immutable.
         * To update the set, use the add/remove actions */
        mediaHandlers: readonlyMediaHandlers,
        getMediaHandlerByTrackId,
        addMediaHandler,
        removeMediaHandler,
        closeContext,
        resumeContext,
        isContextRunning,
    };
});
