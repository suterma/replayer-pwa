<template>
    <!-- eslint-disable-line -->
    <GlobalEvents @keyup.prevent="handleKeyUp" />
    <KeyResponseOverlay :keyText="key" ref="keyResponseOverlay" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import KeyResponseOverlay from '@/components/KeyResponseOverlay.vue';
import { ICue, Compilation } from '@/store/compilation-types';
import { GlobalEvents } from 'vue-global-events';
import { MutationTypes } from '@/store/mutation-types';

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
    },

    watch: {},
    methods: {
        /** Generally handle all keyUp events, by checking for recognisable events
         * @remarks Handles "back to cue" and "keyboard shortcut scan" events
         */
        handleKeyUp(event: KeyboardEvent) {
            console.debug(
                'CompilationKeyboardHandler::handleKeyUp:event',
                event,
            );
            //Next cue?
            if (event.code === 'NumpadMultiply') {
                this.displayEventKey(event);
                this.toNextCue();
            }
            //Previous cue?
            if (event.code === 'NumpadDivide') {
                this.displayEventKey(event);
                this.toPreviousCue();
            }
        },

        /** Displays the key from the keyboard event as textual representation*/
        displayEventKey(event: KeyboardEvent) {
            let eventKey = event.key;
            if (eventKey == ' ') {
                eventKey = 'Space';
            }

            (
                this.$refs.keyResponseOverlay as InstanceType<
                    typeof KeyResponseOverlay
                >
            ).DisplayKey(eventKey);
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

        /** Scans for a keyboard shortcut that matches one of the cues
         * @devdoc //TODO move to more global compilation scan. All available cues in the compilation should be considered, regardless of the                active track
         */
        //scanForKeyboardShortcut() {},
    },
});
</script>
