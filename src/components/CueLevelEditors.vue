<template>
    <!-- Using the v-for on a template instead of the actual component saves unnecessary renderings. 
         See https://stackoverflow.com/a/76074016/79485 
         NOTE: However, in this situation, with the surrounding TransitionGroup, all contained CueLevelEditor
         components still get patched and rendered, at each track time change, even if they
         are not containing the playback head, thus are not visually impacted.
        -->
    <TransitionGroup name="list">
        <template v-for="cue in cues" :key="cue.Id">
            <CueLevelEditor
                :disabled="disabled"
                :cue="cue"
                :playbackMode="playbackMode"
                :isCueSelected="isCueSelected(cue)"
                @click="cueClick(cue)"
                @play="cuePlay(cue)"
                @adjust="cueAdjust(cue)"
            />
        </template>
    </TransitionGroup>
</template>

<script setup lang="ts">
import { PropType, inject } from 'vue';
import { ICue, PlaybackMode } from '@/store/compilation-types';
import CompilationHandler from '@/store/compilation-handler';
import CueLevelEditor from '@/components/CueLevelEditor.vue';
import { useAppStore } from '@/store/app';
import { currentPositionInjectionKey } from './track/TrackInjectionKeys';

/** An set of Editors for for cues in a track.
 */

const emit = defineEmits(['click', 'play']);

defineProps({
    cues: {
        type: Array as PropType<Array<ICue>>,
        required: true,
    },
    disabled: {
        type: Boolean,
        required: false,
    },

    /** The playback mode
     * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
     */
    playbackMode: {
        type: String as () => PlaybackMode,
        required: true,
    },
});

const currentPosition = inject(currentPositionInjectionKey);

const app = useAppStore();

/** Handles the click event of the cue button */
function cueClick(cue: ICue) {
    emit('click', cue);
}

/** Handles the play event of the cue button */
function cuePlay(cue: ICue) {
    emit('play', cue);
}

/** Adjusts the time of the cue to the current playback time */
function cueAdjust(cue: ICue) {
    if (
        currentPosition?.value !== null &&
        currentPosition?.value !== undefined &&
        Number.isFinite(currentPosition.value)
    ) {
        const time = CompilationHandler.roundTime(currentPosition.value);
        const cueId = cue.Id;
        const shortcut = cue.Shortcut;
        const description = cue.Description;
        app.updateCueData(cueId, description, shortcut, time);
    }
}

/** Determines whether this cue is currently selected
 * @remarks Note: only one cue in a compilation may be selected */
function isCueSelected(cue: ICue): boolean {
    //TODO use via provide/inject
    return app.selectedCueId === cue.Id;
}
</script>
