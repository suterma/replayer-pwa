<template>
    <template v-if="hasCompilation && useAppShortcuts">
        <!-- Note: Enter (when not terminating a mnemonic, also toggles playback, via "handleKey") -->
        <!-- Note: '/' and '*' for cue selection are also handled via "handleKey" -->
        <GlobalEvents
            v-if="requireCtrlModifier"
            @keydown.ctrl="handleKey"
            @keydown.ctrl.prevent.-="volumeDown"
            @keydown.ctrl.prevent.+="volumeUp"
            @keydown.ctrl.prevent.left="rewind"
            @keydown.ctrl.prevent.right="forward"
            @keydown.ctrl.prevent.up="previousCue"
            @keydown.ctrl.prevent.down="nextCue"
        />
        <GlobalEvents
            v-else
            @keydown="handleKey"
            @keydown.prevent.-="volumeDown"
            @keydown.prevent.+="volumeUp"
            @keydown.prevent.left="rewind"
            @keydown.prevent.right="forward"
            @keydown.prevent.up="previousCue"
            @keydown.prevent.down="nextCue"
        />
    </template>
</template>

<script setup lang="ts">
import { GlobalEvents } from 'vue-global-events';
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/store/app';
import { Replayer } from './Replayer';
import { ref } from 'vue';
import { useMessageStore } from '@/store/messages';

/** A keyboard handler, which translates specific keyboard events into global
 * Replayer events(at the DOM document level) to handle as
 * - cue actions, for all cues in a compilation
 * - player actions, which get handled by the currently active player (if any)
 * @remarks Events are only handled, when a compilation is currently loaded
 * @remarks The emitted events are those from the @see Replayer enumeration
 * @devdoc The idea is to register for key presses (or other input) at the document level,
 * then translate this input into custom Replayer events, and emit them
 * back at the document level. This should only be done (or handled) if a
 * compilation is loaded.
 * Using a specific Replayer event handler at the appropriate level, these
 * issued Replayer action events can then be handled properly in the suitable
 * Vue component. See also https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
 * @devdoc This keyboard handler is distinct from the general application hotkey
 * handling, which is implemented separately.
 */
defineProps({
    /** Whether to require the CTRL modfier keys for the keyboard events */
    requireCtrlModifier: {
        type: Boolean,
        required: false,
        default: false,
    },
});

/** The mnemonic store.
 * @remarks Used to build up the mnemonic by adding characters to it,
 * for a short amount of time.
 */
const mnemonic = ref('');

/** A timeout id, to handle timeout extensions for building up the mnemonic
 * @devdoc This implementation only supports the browser.
 * See https://stackoverflow.com/questions/45802988/typescript-use-correct-version-of-settimeout-node-vs-window
 */
const keyTimeoutId = ref(0);

const app = useAppStore();
const settings = useSettingsStore();
const { hasCompilation, useAppShortcuts } = storeToRefs(app);
const { keyboardShortcutTimeout } = storeToRefs(settings);

/** Generally handle all keydown events, by checking for recognizable events
 * @remarks Handles "Enter for play/pause", "back to cue" and "keyboard mnemonic" events
 * @remarks Skips repeated events
 * @devdoc Keydown events are used as trigger instead of the non-repetitive keyup events
 * to have a better responsiveness for the user.
 */
function handleKey(event: KeyboardEvent) {
    if (event.repeat) {
        return;
    }

    //Back to cue (dot)?
    if (event.code === 'NumpadDecimal' || event.code === 'Period') {
        event.preventDefault();
        event.stopPropagation();
        DisplayKeyAndAction(event, 'back to cue');
        document.dispatchEvent(new Event(Replayer.BACK_TO_CUE));
    }
    //Next cue?
    else if (event.key === '*') {
        event.preventDefault();
        event.stopPropagation();
        nextCue(event);
    }
    //Previous cue?
    else if (event.key === '/') {
        event.preventDefault();
        event.stopPropagation();
        previousCue(event);
    }
    //Mnemonic termination / play/pause-toggling?
    else if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        if (mnemonic.value) {
            DisplayDataAndAction(mnemonic.value, 'mnemonic invoking');
            document.dispatchEvent(
                new CustomEvent(Replayer.TO_MNEMONIC_CUE, {
                    detail: mnemonic.value,
                }),
            );

            //clear mnemonic buildup
            mnemonic.value = '';
            window.clearTimeout(keyTimeoutId.value);
        } else {
            //just pass on to the matching handler for this action
            togglePlayback(event);
        }
    }
    //is it a shortcut mnemonic key?
    //(any one numeric character)
    else if (event.key.match(/^[0-9]{1}$/g)) {
        event.preventDefault();
        event.stopPropagation();
        mnemonic.value = mnemonic.value + event.key;
        DisplayDataAndAction(mnemonic.value, ' + [ENTER]');

        //(Re-)schedule the timeout
        window.clearTimeout(keyTimeoutId.value);
        keyTimeoutId.value = window.setTimeout(() => {
            mnemonic.value = '';
        }, keyboardShortcutTimeout.value);
    }
    //HINT: if it's not handled, do not prevent the default action, like F12, CTRL-V etc...
}

/** Toggles playback
 * @remarks Skips repeated events
 * @devdoc Keydown events are used as trigger instead of the non-repetitive keyup events
 * to have a better responsiveness for the user.
 */
function togglePlayback(event: KeyboardEvent) {
    if (event.repeat) {
        return;
    }
    DisplayKeyAndAction(event, 'play/pause');
    document.dispatchEvent(new Event(Replayer.TOGGLE_PLAYBACK));
}
/** Rewinds 5 seconds
 * @remarks This handler does accept repetitive events
 */
function rewind(event: KeyboardEvent) {
    DisplayKeyAndAction(event, 'rewind 5 sec');
    document.dispatchEvent(new Event(Replayer.REWIND));
}
/** Forwards 5 seconds
 * @remarks This handler does accept repetitive events
 */
function forward(event: KeyboardEvent) {
    DisplayKeyAndAction(event, 'forward 5 sec');
    document.dispatchEvent(new Event(Replayer.FORWARD));
}

/** Selects the previous cue
 * @remarks This handler does accept repetitive events
 */
function previousCue(event: KeyboardEvent) {
    event.preventDefault();
    DisplayKeyAndAction(event, 'to previous cue');
    document.dispatchEvent(new Event(Replayer.TO_PREV_CUE));
}
/** Selects the next cue
 * @remarks This handler does accept repetitive events
 */
function nextCue(event: KeyboardEvent) {
    event.preventDefault();
    DisplayKeyAndAction(event, 'to next cue');
    document.dispatchEvent(new Event(Replayer.TO_NEXT_CUE));
}

/** Decreases the playback volume
 * @remarks This handler does accept repetitive events
 */
function volumeDown(event: KeyboardEvent) {
    DisplayKeyAndAction(event, 'volume down');
    document.dispatchEvent(new Event(Replayer.VOLUME_DOWN));
}
/** Increases the playback volume
 * @remarks This handler does accept repetitive events
 */
function volumeUp(event: KeyboardEvent) {
    DisplayKeyAndAction(event, 'volume up');
    document.dispatchEvent(new Event(Replayer.VOLUME_UP));
}

// --- message display ---

/** Displays the given key and the associated action for a short duration */
function DisplayKeyAndAction(event: KeyboardEvent, action: string) {
    let eventKey = event.key;
    if (eventKey == ' ') {
        eventKey = 'Space';
    }
    DisplayDataAndAction(eventKey, action);
}

const message = useMessageStore();

/** Displays the given data and the associated action for a short duration */
function DisplayDataAndAction(data: string, action: string) {
    message.pushInputFeedback(data, action);
}
</script>
