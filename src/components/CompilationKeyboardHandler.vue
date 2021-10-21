<template>
    <!-- eslint-disable-line -->
    <GlobalEvents v-if="hasCompilation" @keydown.prevent="handleKey" />
    <KeyResponseOverlay :keyText="key" ref="keyResponseOverlay" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import KeyResponseOverlay from '@/components/KeyResponseOverlay.vue';
import { ICue, Compilation } from '@/store/compilation-types';
import { GlobalEvents } from 'vue-global-events';

/** A keyboard handler, which translates keyboard events into
 * - cue actions, for all cues in a compilation
 * - player actions, which get handeled by the currently active player (if any)
 * @devdoc The idea is, to register for keypresses at the document level, then translate these keypresses
 * into Replayer events, and emit them back at the document level.
 * This should only be done (or handeled) if a compilation is loaded.
 * Using an event handler at the appropriate level, these issued events can then be handeled properly.
 * See also https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
 */
export default defineComponent({
    name: 'CompilationKeyboardHandler',
    components: { GlobalEvents, KeyResponseOverlay },
    props: {
        compilation: {
            type: Compilation,
            default: null,
        },
    },
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
        selectedCue(): ICue {
            return this.$store.getters.selectedCue as ICue;
        },
        allCues(): Array<ICue> {
            const cues = new Array<ICue>();
            this.compilation.Tracks.forEach((track) =>
                cues.push(...track.Cues),
            );
            return cues;
        },
        hasCompilation(): boolean {
            return this.$store.getters.hasCompilation;
        },
    },

    watch: {},
    methods: {
        /** Generally handle all key events, by checking for recognisable events
         * @remarks Handles "back to cue" and "keyboard mnemonic" events
         */
        handleKey(event: KeyboardEvent) {
            console.debug('CompilationKeyboardHandler::handleKey:event', event);
            //Next cue?
            if (event.key === '*') {
                this.DisplayKeyAndAction(event, 'to next cue');
                this.toNextCue();
            }
            //Previous cue?
            else if (event.key === '/') {
                this.DisplayKeyAndAction(event, 'to previous cue');
                this.toPreviousCue();
            }
            //Mnemonic termination?
            else if (event.key === 'Enter') {
                if (this.mnemonic) {
                    this.DisplayDataAndAction(
                        this.mnemonic,
                        'mnemonic invoking',
                    );
                    this.toMatchingCue(this.mnemonic);
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

        toPreviousCue() {
            document.dispatchEvent(new Event('replayer-topreviouscue'));
        },

        toNextCue() {
            document.dispatchEvent(new Event('replayer-tonextcue'));
        },
        toMatchingCue(mnemonic: string) {
            document.dispatchEvent(
                new CustomEvent('replayer-tomnemoniccue', {
                    detail: mnemonic,
                }),
            );
        },
    },
});
</script>
