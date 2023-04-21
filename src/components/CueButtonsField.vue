<template>
    <div class="cue-buttons-field buttons has-gap is-fullwidth">
        <!-- A virtual cue button as prefix, when the first cue is not at the zero position -->
        <CueButton
            v-if="prefixCue.Duration ?? 0 > 0"
            :id="prefixCue.Id"
            class="is-flex-grow-1 is-flex-shrink-5"
            :disabled="disabled || !Number.isFinite(prefixCue.Time)"
            :time="prefixCue.Time"
            :shortcut="prefixCue.Shortcut"
            :duration="prefixCue.Duration"
            :description="prefixCue.Description"
            :isTrackPlaying="isTrackPlaying"
            :playbackMode="playbackMode"
            hasAddonsRight
            virtual
            :isCueSelected="isCueSelected(prefixCue)"
            :hasCuePassed="hasCuePassed(prefixCue)"
            :isCueAhead="isCueAhead(prefixCue)"
            :percentComplete="percentComplete(prefixCue)"
            @click="cueClicked"
        >
        </CueButton>
        <template v-for="cue in cues" :key="cue.Id">
            <CueButton
                class="is-flex-grow-1"
                :id="cue.Id"
                :disabled="disabled || !Number.isFinite(cue.Time)"
                :time="cue.Time"
                :shortcut="cue.Shortcut"
                :duration="cue.Duration"
                :description="cue.Description"
                :isTrackPlaying="isTrackPlaying"
                :playbackMode="playbackMode"
                hasAddonsRight
                :isCueSelected="isCueSelected(cue)"
                :hasCuePassed="hasCuePassed(cue)"
                :isCueAhead="isCueAhead(cue)"
                :percentComplete="percentComplete(cue)"
                @click="cueClicked"
            >
            </CueButton>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits, PropType } from 'vue';
import { Cue, ICue, PlaybackMode } from '@/store/compilation-types';
import CueButton from '@/components/buttons/CueButton.vue';
import CompilationHandler from '@/store/compilation-handler';
import { useStore } from 'vuex';

/** A field of large cue buttons for a track
 */

const emit = defineEmits(['click']);

const props = defineProps({
    /** The playback progress in the current track, in [seconds]
     * @remarks This is used for progress display within the set of cues
     */
    currentSeconds: Number,

    /** The cues to show
     */
    cues: Array as PropType<Array<ICue>>,

    /** Indicates whether the associated Track is currently playing
     * @remarks This is used to depict the expected action on button press. While playing, this is pause, and vice versa.
     */
    isTrackPlaying: Boolean,
    /** Whether to show the component in a disabled state
     * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
     */
    disabled: Boolean,
    /** The playback mode
     * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
     */
    playbackMode: {
        type: String as () => PlaybackMode,
        required: true,
    },
});

/** A static cue id for the prefix cue */
const prefixCueButtonId = 'prefix';

/** Handler for a cue clicked event
 * @remarks Emits a click event with the respective cue
 * @devdoc The cue object or id is intentionally not provided from inside the v-for, because using a property-based value
 * for an event handler in a v-for causes excess rendering operations for components inside v-for loops. See https://stackoverflow.com/a/74270334/79485
 * Instead, the respective cue id is reclaimed inside this handler only at an actual click.
 */
function cueClicked(event: PointerEvent): void {
    console.debug('cueClicked', event);
    //emit the  clicked button
    const clickedCueId = (event.target as HTMLElement).id;
    if (clickedCueId === prefixCueButtonId) {
        emit('click', prefixCue.value);
    } else {
        if (props.cues) {
            const clickedCue = CompilationHandler.getCueById(
                props.cues,
                clickedCueId,
            );
            if (clickedCue) {
                emit('click', clickedCue);
            }
        }
    }
}

/** Defines a virtual cue, that acts as a placeholder when the first defined cue is not at the track start. */
const prefixCue = computed(() => {
    return new Cue(
        'the Beginning',
        '',
        0,
        props.cues?.[0]?.Time ?? null,
        prefixCueButtonId,
    );
});

const store = useStore();

/** Determines whether the given cue is currently selected
 * @remarks Note: only one cue in a compilation may be selected */
function isCueSelected(cue: ICue): boolean {
    //TODO use via provide/inject
    return store.getters.selectedCueId == cue.Id;
}

/** Determines whether playback of the given cue has already passed
 * @remarks Is used for visual indication of playback progress
 * @param cue - the cue to determine the playback progress for
 */
function hasCuePassed(cue: ICue): boolean {
    return CompilationHandler.hasCuePassed(cue, props.currentSeconds);
}
/** Determines whether playback of the given cue has not yet started
 * @param cue - the cue to determine the playback progress for
 */
function isCueAhead(cue: ICue): boolean {
    return CompilationHandler.isCueAhead(cue, props.currentSeconds);
}
/** The playback progress within the given cue, in [percent], or null if not applicable
 * @param cue - the cue to determine the playback progress for
 */
function percentComplete(cue: ICue): number | null {
    return CompilationHandler.percentComplete(cue, props.currentSeconds);
}
</script>
<style lang="scss">
.cue-buttons-field.buttons {
    /* Virtual buttons should take up not unnecessary much space */
    .cue.button.is-virtual {
        max-width: 14em;
    }
}
</style>
