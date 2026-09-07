import { expect, describe, it, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useMediaEvents } from './MediaEvents';
import { useSettingsStore } from '@/store/settings';
import { ReplayerEvent } from '@/code/ui/ReplayerEvent';

describe('MediaEvents.ts', () => {
    let handlers: Record<string, () => void>;

    beforeEach(() => {
        setActivePinia(createPinia());
        handlers = {};

        // Mock navigator.mediaSession
        Object.defineProperty(globalThis.navigator, 'mediaSession', {
            value: {
                setActionHandler: vi.fn((action: string, handler: any) => {
                    handlers[action] = handler;
                }),
            },
            writable: true,
            configurable: true,
        });
    });

    it('should dispatch cue events for nexttrack/previoustrack', () => {
        const settings = useSettingsStore();
        settings.handleMediaEventTracksAsCues = true;

        const dispatchedEvents: string[] = [];
        const listener = (event: Event) => dispatchedEvents.push(event.type);

        window.addEventListener(ReplayerEvent.TO_NEXT_CUE, listener);
        window.addEventListener(ReplayerEvent.TO_PREV_CUE, listener);

        useMediaEvents();

        handlers['nexttrack']?.();
        expect(dispatchedEvents).toContain(ReplayerEvent.TO_NEXT_CUE);

        handlers['previoustrack']?.();
        expect(dispatchedEvents).toContain(ReplayerEvent.TO_PREV_CUE);

        window.removeEventListener(ReplayerEvent.TO_NEXT_CUE, listener);
        window.removeEventListener(ReplayerEvent.TO_PREV_CUE, listener);
    });

    it('should dispatch track events for nexttrack/previoustrack when handleMediaEventTracksAsCues is false', () => {
        const settings = useSettingsStore();
        settings.handleMediaEventTracksAsCues = false;

        const dispatchedEvents: string[] = [];
        const listener = (event: Event) => dispatchedEvents.push(event.type);

        window.addEventListener(ReplayerEvent.TO_NEXT_TRACK, listener);
        window.addEventListener(ReplayerEvent.TO_PREV_TRACK, listener);

        useMediaEvents();

        handlers['nexttrack']?.();
        expect(dispatchedEvents).toContain(ReplayerEvent.TO_NEXT_TRACK);

        handlers['previoustrack']?.();
        expect(dispatchedEvents).toContain(ReplayerEvent.TO_PREV_TRACK);

        window.removeEventListener(ReplayerEvent.TO_NEXT_TRACK, listener);
        window.removeEventListener(ReplayerEvent.TO_PREV_TRACK, listener);
    });
});
