<template>
    <!-- Using the v-for on a template instead of the actual component usually saves unnecessary renderings. 
         See https://stackoverflow.com/a/76074016/79485 
         
         NOTE: However, in this situation, with the surrounding TransitionGroup, all contained CueLevelEditor
         components still get patched and rendered, at each position time change, even if they
         are not containing the playback head, thus are not visually impacted.
         Because of this, for simplicity, the variant without template 
         is used instead, with some pause/resume for the event handling applied.
        -->
    <TransitionGroup
        name="list"
        @before-enter="pause"
        @afterEnter="resume"
        @beforeLeave="pause"
        @afterLeave="resume"
    >
        <CueLevelEditor
            v-for="cue in cues"
            :key="cue.Id"
            :disabled="disabled"
            :cue="cue"
            :playbackMode="playbackMode"
            :hasCuePassed="hasCuePassed(cue)"
            :isCueAhead="isCueAhead(cue)"
            :percentComplete="percentComplete(cue)"
            :isCueSelected="isCueSelected(cue)"
            @click="cueClick(cue)"
            @play="cuePlay(cue)"
            @adjust="cueAdjust(cue)"
        />
    </TransitionGroup>
</template>

<script setup lang="ts">
import { PropType, Ref, inject, ref } from 'vue';
import { ICue, PlaybackMode } from '@/store/compilation-types';
import CompilationHandler from '@/store/compilation-handler';
import CueLevelEditor from '@/components/CueLevelEditor.vue';
import { useAppStore } from '@/store/app';
import { currentPositionInjectionKey } from './track/TrackInjectionKeys';
import { useRafFn } from '@vueuse/core';

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

/** Throttling (and pausing during transition) the position update handling
 * to keep the UI more responsive overall*/
const currentPositionThrottled: Ref<number | null> = ref(null);
const { pause, resume } = useRafFn(() => {
    currentPositionThrottled.value = currentPosition?.value ?? null;
});

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

/** Determines whether playback of the given cue has already passed
 * @remarks Is used for visual indication of playback progress
 * @param cue - the cue to determine the playback progress for
 */
function hasCuePassed(cue: ICue): boolean {
    return CompilationHandler.hasCuePassed(cue, currentPositionThrottled.value);
}
/** Determines whether playback of the given cue has not yet started
 * @param cue - the cue to determine the playback progress for
 */
function isCueAhead(cue: ICue): boolean {
    return CompilationHandler.isCueAhead(cue, currentPositionThrottled.value);
}
/** The playback progress within the given cue, in [percent], or null if not applicable
 * @param cue - the cue to determine the playback progress for
 */
function percentComplete(cue: ICue): number | null {
    return CompilationHandler.percentComplete(
        cue,
        currentPositionThrottled.value,
    );
}
</script>
