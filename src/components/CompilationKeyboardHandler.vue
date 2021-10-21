<template>
    <!-- Note: Enter (when not terminating a mnemonic, also toggles playback, via "handleKey") -->
    <!-- Note: "/"" and "*"" are also handeled via "handleKey" -->
    <GlobalEvents
        v-if="hasCompilation"
        @keydown.prevent="handleKey"
        @keydown.prevent.space="togglePlayback"
        @keydown.prevent.-="volumeDown"
        @keydown.prevent.+="volumeUp"
        @keydown.prevent.left="rewind"
        @keydown.prevent.right="forward"
    />
    <KeyResponseOverlay :keyText="key" ref="keyResponseOverlay" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import KeyResponseOverlay from '@/components/KeyResponseOverlay.vue';
import { GlobalEvents } from 'vue-global-events';

/** A keyboard handler, which translates keyboard events into
 * - cue actions, for all cues in a compilation
 * - player actions, which get handeled by the currently active player (if any)
 * @devdoc The idea is to register for keypresses at the document level, then translate these keypresses
 * into custom replayer events, and emit them back at the document level.
 * This should only be done (or handeled) if a compilation is loaded.
 * Using an event handler at the appropriate level, these issued replayer action events can then be handeled properly.
 * See also https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
 */
export default defineComponent({
    name: 'CompilationKeyboardHandler',
    components: { GlobalEvents, KeyResponseOverlay },
    props: {},
    data() {
        return {
            /** The character representation of the currently pressed key (or keys, when handling a shortcut) */
            key: '',
            /** The mnemonic store.
             * @remarks Used to build up the mnemonic by adding characters to it, for a short amount of time.
             */
            mnemonic: '',
            /** A timeout id, to handle timeout extensions for building up the mnemonic*/
            keyTimeoutId: new Object() as ReturnType<typeof setTimeout>,
        };
    },
    computed: {
        hasCompilation(): boolean {
            return this.$store.getters.hasCompilation;
        },
    },
    methods: {
        /** Generally handle all key events, by checking for recognisable events
         * @remarks Handles "Enter for play/pause", "back to cue" and "keyboard mnemonic" events
         */
        handleKey(event: KeyboardEvent) {
            console.debug('CompilationKeyboardHandler::handleKey:event', event);
            //Back to cue (dot)?
            if (event.code === 'NumpadDecimal' || event.code === 'Period') {
                this.DisplayKeyAndAction(event, 'back to cue');
                document.dispatchEvent(new Event('replayer:backtocue'));
            }
            //Next cue?
            else if (event.key === '*') {
                this.DisplayKeyAndAction(event, 'to next cue');
                document.dispatchEvent(new Event('replayer:tonextcue'));
            }
            //Previous cue?
            else if (event.key === '/') {
                this.DisplayKeyAndAction(event, 'to previous cue');
                document.dispatchEvent(new Event('replayer:topreviouscue'));
            }
            //Mnemonic termination / play/pause-toggeling?
            else if (event.key === 'Enter') {
                if (this.mnemonic) {
                    this.DisplayDataAndAction(
                        this.mnemonic,
                        'mnemonic invoking',
                    );
                    document.dispatchEvent(
                        new CustomEvent('replayer:tomnemoniccue', {
                            detail: this.mnemonic,
                        }),
                    );
                } else {
                    //just pass for appropriate handling
                    this.togglePlayback(event);
                }
            }
            //any one alphanumeric character from the basic Latin alphabet, including the underscore (shortcut mnemonic key)?
            else if (event.key.match(/^\w{1}$/g)) {
                this.mnemonic = this.mnemonic + event.key;
                this.DisplayDataAndAction(this.mnemonic, 'mnemonic');

                //(Re-)schedule the timeout
                clearTimeout(this.keyTimeoutId);
                this.keyTimeoutId = setTimeout(() => {
                    this.mnemonic = '';
                }, 500);
            }
            //TODO if later necessary, specifically allow some keys to have the default function, like F12
        },

        /** Toggles playback */
        togglePlayback(event: KeyboardEvent) {
            this.DisplayKeyAndAction(event, 'play/pause');
            document.dispatchEvent(new Event('replayer:toggleplaypause'));
        },
        /** Rewinds 1 second */
        rewind(event: KeyboardEvent) {
            this.DisplayKeyAndAction(event, 'rewind 1 sec');
            document.dispatchEvent(new Event('replayer:rewind1sec'));
        },
        /** Forwards 1 second */
        forward(event: KeyboardEvent) {
            this.DisplayKeyAndAction(event, 'forward 1 sec');
            document.dispatchEvent(new Event('replayer:forward1sec'));
        },
        /** Decreases the playback volume */
        volumeDown(event: KeyboardEvent) {
            this.DisplayKeyAndAction(event, 'volume down');
            document.dispatchEvent(new Event('replayer:volumedown'));
        },
        /** Increases the playback volume */
        volumeUp(event: KeyboardEvent) {
            this.DisplayKeyAndAction(event, 'volume up');
            document.dispatchEvent(new Event('replayer:volumeup'));
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
