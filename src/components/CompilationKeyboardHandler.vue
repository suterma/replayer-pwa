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
import { MutationTypes } from '@/store/mutation-types';


    -//..Idee Globaler Keyboard handler, welcher die Keyboard Events in ActionRequests umwandelt, welche dann
    //von der jeweils zuständigen Komponente behandelt werden können

/** A keyboard handler, which translates keyboard shortcuts into cue actions, for all cues in a compilation
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
         * @remarks Handles "back to cue" and "keyboard mnemonic scan" events
         */
        handleKey(event: KeyboardEvent) {
            console.debug('CompilationKeyboardHandler::handleKey:event', event);
            //Next cue?
            if (event.code === 'NumpadMultiply') {
                this.DisplayKeyAndAction(event, 'to next cue');
                this.toNextCue();
            }
            //Previous cue?
            else if (event.code === 'NumpadDivide') {
                this.DisplayKeyAndAction(event, 'to previous cue');
                this.toPreviousCue();
            }
            //Mnemonic termination?
            else if (event.code === 'Enter') {
                if (this.mnemonic) {
                    // event.stopPropagation();
                    // event.stopImmediatePropagation();
                    // event.preventDefault();

                    this.DisplayDataAndAction(
                        this.mnemonic,
                        'mnemonic invoking',
                    );
                    this.toMatchingCue(this.mnemonic);
                }
            }
            //any one alphanumeric character from the basic Latin alphabet, including the underscore (shortcut mnemonic)?
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
            console.debug('CompilationKeyboardHandler::toPreviousCue');
            console.log(this.selectedCue);
            var allCues = this.allCues;

            console.debug(
                'CompilationKeyboardHandler::toPreviousCue:',
                allCues,
            );

            var indexOfSelected = allCues.indexOf(this.selectedCue);
            console.debug(
                'CompilationKeyboardHandler::indexOfSelected:',
                indexOfSelected,
            );

            var nextCue = allCues[indexOfSelected - 1];
            console.debug(
                'CompilationKeyboardHandler::indexOfSelected:',
                nextCue,
            );
            this.$store.commit(MutationTypes.UPDATE_CURRENT_CUE, nextCue);
        },

        toNextCue() {
            console.debug('CompilationKeyboardHandler::toNextCue');
            console.log(this.selectedCue);
            var allCues = this.allCues;

            console.debug('CompilationKeyboardHandler::toNextCue:', allCues);

            var indexOfSelected = allCues.indexOf(this.selectedCue);
            console.debug(
                'CompilationKeyboardHandler::indexOfSelected:',
                indexOfSelected,
            );

            var nextCue = allCues[indexOfSelected + 1];
            console.debug(
                'CompilationKeyboardHandler::indexOfSelected:',
                nextCue,
            );
            this.$store.commit(MutationTypes.UPDATE_CURRENT_CUE, nextCue);
        },
        toMatchingCue(mnemonic: string) {
            console.debug(
                'CompilationKeyboardHandler::toMatchingCue:mnemonic',
                mnemonic,
            );

            var allCues = this.allCues;

            var matchingCue = allCues.find((cue) => cue.Shortcut == mnemonic);
            console.debug(
                'CompilationKeyboardHandler::toMatchingCue:matchingCue',
                matchingCue,
            );
            if (matchingCue) {
                this.$store.commit(
                    MutationTypes.UPDATE_CURRENT_CUE,
                    matchingCue,
                );
                //TODO Always pause playback
            }
        },
    },
});
</script>
