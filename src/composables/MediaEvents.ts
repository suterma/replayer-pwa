import { ReplayerEvent } from '@/code/ui/ReplayerEvent.ts';
import { useSettingsStore } from '@/store/settings';

/**
 * Dispatch a semantic Replayer application event.
 */
function emitReplayerEvent(event: ReplayerEvent): void {
    window.dispatchEvent(new Event(event));
}

/**
 * Register for global Media Session events.
 * @remarks Call this composable once during application startup.
 * @remarks The dedicated Stop event behaves like the "dot", returning to the current cue, if any.
 * This supports a minimal setup with only a dedicated play and dedicated stop buttons.
 * Any play/pause cycle actually toggles the play state without special cue handling, as expected.
 * @devdoc See https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler for details.
 */
export function useMediaEvents() {
    const settings = useSettingsStore();

    const mediaSessionHandlers: Array<{
        action: MediaSessionAction;
        handler: MediaSessionActionHandler;
    }> = [
        //TODO docuemnt all these in the web page
        {
            action: 'play',
            handler: () => emitReplayerEvent(ReplayerEvent.PLAY),
        },
        {
            action: 'pause',
            handler: () => emitReplayerEvent(
                settings.handleMediaEventPauseAsReturnToCue
                    ? ReplayerEvent.BACK_TO_CUE
                    : ReplayerEvent.PAUSE,
            ),
        },
        {
            action: 'stop',
            handler: () =>
                emitReplayerEvent(
                    ReplayerEvent.BACK_TO_CUE /* NOTE: This also pauses the playback */,
                ),
        },
        {
            action: 'nexttrack',
            handler: () =>
                emitReplayerEvent(
                    settings.handleMediaEventTracksAsCues
                        ? ReplayerEvent.TO_NEXT_CUE
                        : ReplayerEvent.TO_NEXT_TRACK,
                ),
        },
        {
            action: 'previoustrack',
            handler: () =>
                emitReplayerEvent(
                    settings.handleMediaEventTracksAsCues
                        ? ReplayerEvent.TO_PREV_CUE
                        : ReplayerEvent.TO_PREV_TRACK,
                ),
        },
        {
            action: 'seekforward',
            handler: () => emitReplayerEvent(ReplayerEvent.FORWARD),
        },
        {
            action: 'seekbackward',
            handler: () => emitReplayerEvent(ReplayerEvent.REWIND),
        },
    ];

    if ('mediaSession' in navigator) {
        for (const { action, handler } of mediaSessionHandlers) {
            try {
                navigator.mediaSession.setActionHandler(action, handler)
            } catch {
                // Some browsers support Media Session but not every action.
            }
        }
    }

    /**
     * Unregister from events
     * @remarks Since this composable is installed once at application startup,
     * this normally corresponds to application shutdown.
     */
    function destroy(): void {
        if ('mediaSession' in navigator) {
            for (const { action } of mediaSessionHandlers) {
                try {
                    navigator.mediaSession.setActionHandler(action, null)
                } catch {
                    // Ignore unsupported actions.
                }
            }
        }
    }

    return {
        destroy,
    }
}

