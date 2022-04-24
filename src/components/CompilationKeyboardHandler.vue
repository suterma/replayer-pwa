<template>
    <!-- Note: Enter (when not terminating a mnemonic, also toggles playback, via "handleKey") -->
    <!-- Note: "/"" and "*"" are also handeled via "handleKey" -->
    <GlobalEvents
        v-if="hasCompilation"
        @keydown.prevent="handleKey"
        @keydown.prevent.-="volumeDown"
        @keydown.prevent.+="volumeUp"
        @keydown.prevent.left="rewind"
        @keydown.prevent.right="forward"
    />
    <KeyResponseOverlay
        :keyText="key"
        ref="keyResponseOverlay"
        :displayTimeout="this.keyboardShortcutTimeout"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import KeyResponseOverlay from '@/components/KeyResponseOverlay.vue';
import { GlobalEvents } from 'vue-global-events';
import { settingsMixin } from '@/mixins/settingsMixin';

/** A set of Replayer events that are emitted by this Keyboard handler */
export enum Replayer {
    BACK_TO_CUE = 'backtocue',
    TO_NEXT_CUE = 'tonextcue',
    TO_PREV_CUE = 'topreviouscue',
    TO_MNEMONIC_CUE = 'tomnemoniccue',
    TOGGLE_PLAYBACK = 'toggleplayback',
    RWD_1SEC = 'rewind1sec',
    FWD_1SEC = 'forward1sec',
    VOLUME_DOWN = 'volumedown',
    VOLUME_UP = 'volumeup',
}

/** A keyboard handler, which translates specific keyboard events into global
 * Replayer events(at the DOM document level) to handle as
 * - cue actions, for all cues in a compilation
 * - player actions, which get handeled by the currently active player (if any)
 * @devdoc The idea is to register for keypresses at the document level,
 * then translate these keypresses into custom Replayer events, and emit them
 * back at the document level. This should only be done (or handeled) if a
 * compilation is loaded.
 * Using a specific Replayer event handler at the appropriate level, these
 * issued Replayer action events can then be handeled properly in the suitable
 * Vue component. See also https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
 * @devdoc This keyboard hander is distinct from the general application hotkey
 * handling, which is implemented separately.
 */
export default defineComponent({
    name: 'CompilationKeyboardHandler',
    components: { GlobalEvents, KeyResponseOverlay },
    mixins: [settingsMixin],
    props: {},
    data() {
        return {
            /** The character representation of the currently pressed key
             * (or keys, when handling a shortcut) */
            key: '',
            /** The mnemonic store.
             * @remarks Used to build up the mnemonic by adding characters to it,
             * for a short amount of time.
             */
            mnemonic: '',

            /** A timeout id, to handle timeout extensions for building up the mnemonic
             * @devdoc This implementation only suppors the browser.
             * See https://stackoverflow.com/questions/45802988/typescript-use-correct-version-of-settimeout-node-vs-window
             */
            keyTimeoutId: 0,
        };
    },
    computed: {
        hasCompilation(): boolean {
            return this.$store.getters.hasCompilation;
        },
        /** A timeout duration, used for the mnemonic build-up as well as the keyboard shortcut display timeout
         */
        keyboardShortcutTimeout(): number {
            return this.getSettings.keyboardShortcutTimeout;
        },
    },
    methods: {
        /** Generally handle all keydown events, by checking for recognisable events
         * @remarks Handles "Enter for play/pause", "back to cue" and "keyboard mnemonic" events
         * @remarks Skips repeated events
         * @devdoc Keydown events are used as trigger instead of the non-repetitive keyup events
         * to have a better responsiveness for the user.
         */
        handleKey(event: KeyboardEvent) {
            if (event.repeat) {
                return;
            }

            //Back to cue (dot)?
            if (event.code === 'NumpadDecimal' || event.code === 'Period') {
                this.DisplayKeyAndAction(event, 'back to cue');
                document.dispatchEvent(new Event(Replayer.BACK_TO_CUE));
            }
            //Next cue?
            else if (event.key === '*') {
                this.DisplayKeyAndAction(event, 'to next cue');
                document.dispatchEvent(new Event(Replayer.TO_NEXT_CUE));
            }
            //Previous cue?
            else if (event.key === '/') {
                this.DisplayKeyAndAction(event, 'to previous cue');
                document.dispatchEvent(new Event(Replayer.TO_PREV_CUE));
            }
            //Mnemonic termination / play/pause-toggeling?
            else if (event.key === 'Enter') {
                if (this.mnemonic) {
                    this.DisplayDataAndAction(
                        this.mnemonic,
                        'mnemonic invoking',
                    );
                    document.dispatchEvent(
                        new CustomEvent(Replayer.TO_MNEMONIC_CUE, {
                            detail: this.mnemonic,
                        }),
                    );

                    //clear mnemonic buildup
                    this.mnemonic = '';
                    window.clearTimeout(this.keyTimeoutId);
                } else {
                    //just pass on to the matching handler for this action
                    this.togglePlayback(event);
                }
            }
            //is it a shortcut mnemonic key?
            //(any one alphanumeric character from the basic Latin alphabet, including the underscore)
            else if (event.key.match(/^\w{1}$/g)) {
                this.mnemonic = this.mnemonic + event.key;
                this.DisplayDataAndAction(this.mnemonic, 'mnemonic');

                //(Re-)schedule the timeout
                window.clearTimeout(this.keyTimeoutId);
                this.keyTimeoutId = window.setTimeout(() => {
                    this.mnemonic = '';
                }, this.keyboardShortcutTimeout);
            }
            //HINT if later necessary, specifically allow some keys to have the default function, like F12
        },

        /** Toggles playback
         * @remarks Skips repeated events
         * @devdoc Keydown events are used as trigger instead of the non-repetitive keyup events
         * to have a better responsiveness for the user.
         */
        togglePlayback(event: KeyboardEvent) {
            if (event.repeat) {
                return;
            }
            this.DisplayKeyAndAction(event, 'play/pause');
            document.dispatchEvent(new Event(Replayer.TOGGLE_PLAYBACK));
        },
        /** Rewinds 1 second
         * @remarks This handler does accept repetitive events
         */
        rewind(event: KeyboardEvent) {
            this.DisplayKeyAndAction(event, 'rewind 1 sec');
            document.dispatchEvent(new Event(Replayer.RWD_1SEC));
        },
        /** Forwards 1 second
         * @remarks This handler does accept repetitive events
         */
        forward(event: KeyboardEvent) {
            this.DisplayKeyAndAction(event, 'forward 1 sec');
            document.dispatchEvent(new Event(Replayer.FWD_1SEC));
        },
        /** Decreases the playback volume
         * @remarks This handler does accept repetitive events
         */
        volumeDown(event: KeyboardEvent) {
            this.DisplayKeyAndAction(event, 'volume down');
            document.dispatchEvent(new Event(Replayer.VOLUME_DOWN));
        },
        /** Increases the playback volume
         * @remarks This handler does accept repetitive events
         */
        volumeUp(event: KeyboardEvent) {
            this.DisplayKeyAndAction(event, 'volume up');
            document.dispatchEvent(new Event(Replayer.VOLUME_UP));
        },

        /** Displays the given key and the associated action for a short duration */
        DisplayKeyAndAction(event: KeyboardEvent, action: string) {
            let eventKey = event.key;
            if (eventKey == ' ') {
                eventKey = 'Space';
            }
            this.DisplayDataAndAction(eventKey, action);
        },

        /** Displays the given data and the associated action for a short duration */
        DisplayDataAndAction(data: string, action: string) {
            (
                this.$refs.keyResponseOverlay as InstanceType<
                    typeof KeyResponseOverlay
                >
            ).DisplayDataAndAction(data, action);
        },
    },
});
</script>
