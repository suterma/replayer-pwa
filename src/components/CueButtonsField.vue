<template>
    <div class="cue-buttons-field buttons has-gap is-fullwidth">
        <!-- A virtual cue button as prefix, when the first cue is not at the zero position -->
        <CueButton
            v-if="(prefixCue.Duration ?? 0 > 0) && showInitialZeroTimeCue"
            :id="prefixCue.Id"
            class="is-flex-grow-1 is-flex-shrink-5"
            :class="{
                'is-success': isCueSelected(prefixCue),
                'is-warning': !isCueSelected(prefixCue),
            }"
            :disabled="disabled || !Number.isFinite(prefixCue.Time)"
            :time="prefixCue.Time"
            :shortcut="prefixCue.Shortcut"
            :duration="prefixCue.Duration"
            :description="prefixCue.Description"
            :playback-mode="playbackMode"
            has-addons-right
            virtual
            show-text
            show-duration
            :has-cue-passed="hasCuePassed(prefixCue)"
            :is-cue-ahead="isCueAhead(prefixCue)"
            :percent-complete="percentComplete(prefixCue)"
            :omit-pre-roll="true"
            :is-cue-selected="isCueSelected(prefixCue)"
            :is-cue-scheduled="isCueScheduled(prefixCue)"
            focus-on-selection
            @click="cueClicked"
        >
        </CueButton>
        <!-- Using the v-for on a template instead of the actual component saves unnecessary renderings. 
             See https://stackoverflow.com/a/76074016/79485 -->
        <template v-for="cue in track.Cues" :key="cue.Id">
            <CueButton
                :id="cue.Id"
                class="is-flex-grow-1"
                :class="{
                    'is-success': isCueSelected(cue),
                    'is-warning': !isCueSelected(cue),
                }"
                :disabled="disabled || !Number.isFinite(cue.Time)"
                :time="cue.Time"
                :shortcut="cue.Shortcut"
                :duration="cue.Duration"
                :description="cue.Description"
                :playback-mode="playbackMode"
                has-addons-right
                show-text
                show-duration
                :has-cue-passed="hasCuePassed(cue)"
                :is-cue-ahead="isCueAhead(cue)"
                :percent-complete="percentComplete(cue)"
                :omit-pre-roll="cue.OmitPreRoll"
                :omit-fade-in="cue.OmitFadeIn"
                :is-cue-selected="isCueSelected(cue)"
                :is-cue-scheduled="isCueScheduled(cue)"
                focus-on-selection
                @click="cueClicked"
            >
            </CueButton>
        </template>
    </div>

    <div
        v-if="isActiveTrack && showAddCueButtonInPlayView"
        class="cue-buttons-field buttons has-gap is-fullwidth"
    >
        <!-- Delete Cue (With Hotkey, for the active track) -->
        <Hotkey
            v-if="track.Cues.length > 0 && canDeleteCue"
            v-slot="{ clickRef }"
            :disabled="disabled || !canDeleteCue"
            :keys="['del']"
            @hotkey="message.pushInputFeedback('DELETE', 'Trash selected')"
        >
            <CueButton
                :id="track.Id + '-inline-delete-cue'"
                :ref="clickRef"
                class="is-flex-grow-1 is-flex-shrink-5 is-info is-colorless is-outlined"
                title="Removes the selected cue"
                :disabled="disabled || !canDeleteCue"
                :time="selectedCue?.Time"
                shortcut="DELETE"
                description="Remove selected"
                :playback-mode="PlaybackMode.PlayCue"
                has-addons-right
                show-text
                :icon-path-override="mdiTrashCanOutline"
                :has-cue-passed="false"
                :is-cue-ahead="true"
                :percent-complete="0"
                :omit-pre-roll="true"
                :is-cue-selected="false"
                :is-cue-scheduled="false"
                data-cy="delete-cue"
                @click="deleteSelectedCue"
            >
            </CueButton>
        </Hotkey>
        <!-- Create Cue (With Hotkey, for the active track) -->
        <Hotkey
            v-else
            v-slot="{ clickRef }"
            :disabled="disabled || !canCreateCue"
            :keys="['insert']"
            @hotkey="message.pushInputFeedback('INSERT', 'Cue')"
        >
            <CueButton
                v-if="isActiveTrack"
                :id="track.Id + '-inline-insert-cue'"
                :ref="clickRef"
                class="is-flex-grow-1 is-flex-shrink-5 is-warning is-outlined"
                title="Add a cue now (at the current playback time)!"
                :disabled="disabled || !canCreateCue"
                :time="currentPosition"
                shortcut="INSERT"
                description="Cue"
                :playback-mode="PlaybackMode.PlayCue"
                has-addons-right
                show-text
                :icon-path-override="mdiPlus"
                :has-cue-passed="false"
                :is-cue-ahead="true"
                :percent-complete="0"
                :omit-pre-roll="true"
                :is-cue-selected="false"
                :is-cue-scheduled="false"
                data-cy="insert-cue"
                @click="createNewCue"
            ></CueButton>
        </Hotkey>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, type PropType } from 'vue';
import CueButton from '@/components/buttons/CueButton.vue';
import CompilationHandler from '@/store/compilation-handler';
import { useAppStore } from '@/store/app';
import { storeToRefs } from 'pinia';
import {
    currentPositionInjectionKey,
    isPlayingInjectionKey,
} from './track/TrackInjectionKeys';
import { PlaybackMode } from '@/store/PlaybackMode';
import type { ICue } from '@/store/ICue';
import { Cue } from '@/store/Cue';
import type { ITrack } from '@/store/ITrack';
import { mdiTrashCanOutline, mdiPlus } from '@mdi/js';
import { Hotkey } from '@simolation/vue-hotkey';
import { useMessageStore } from '@/store/messages';
import { useSettingsStore } from '@/store/settings';

/** A field of large cue buttons for a track
 */

const emit = defineEmits(['click']);

const props = defineProps({
    /** The track, for which to show the cues
     */
    track: {
        type: Object as PropType<ITrack>,
        required: true,
    },

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

    /** Whether this is the active track
     * @remarks Determines whether the
     * create cue button is shown in the field.
     */
    isActiveTrack: {
        type: Boolean,
        required: true,
    },
});

// --- cue edit features ---

const currentPosition = inject(currentPositionInjectionKey);

/** Handles the request for a new cue by creating one for the current time
 */
function createNewCue(): void {
    if (currentPosition?.value != null) {
        const cueId = app.addCueAtTime(props.track.Id, currentPosition.value);

        // focus the new cue button (to keep the focus from staying with the Add-Cue button)
        nextTick(() => {
            const element = document.getElementById(cueId);
            element?.focus();
        });
    }
}

/** Handles the request for deletion of the currently selected cue.
 */
function deleteSelectedCue(): void {
    const cueId = selectedCueId.value;
    app.deleteCue(cueId);
}

/** Whether a cue can be deleted
 * @remarks Only a selected cue without a description can be deleted,
 * only when playback is paused and
 * only when the current playhead time matches
 * the selected cue's time
 */
const canDeleteCue = computed(() => {
    return (
        !isTrackPlaying?.value &&
        selectedCue.value &&
        !selectedCue.value?.Description &&
        CompilationHandler.areSimilar(
            selectedCue.value.Time,
            currentPosition?.value,
        )
    );
});

/** Whether a cue can be created
 */
const canCreateCue = computed(() => {
    return selectedCue.value?.Time != currentPosition?.value;
});

/** Indicates whether this track's player is currently playing
 * @remarks This is used to depict the expected action on button press. While playing, this is pause, and vice versa.
 */
const isTrackPlaying = inject(isPlayingInjectionKey);

const message = useMessageStore();

// --- cue display and handling ---

/** A static cue id for the prefix cue */
const prefixCueButtonId = 'prefix';

/** Handler for a cue clicked event
 * @remarks Emits a click event with the respective cue
 * @devdoc The cue object (or id) is intentionally not provided from inside the v-for, because using a property-based value
 * for an event handler in a v-for causes excess rendering operations for components inside v-for loops. See https://stackoverflow.com/a/74270334/79485
 * Instead, the respective cue id is reclaimed inside this handler only at an actual click.
 */
function cueClicked(event: PointerEvent): void {
    const clickedCueId = (event.target as HTMLElement).id;
    if (clickedCueId === prefixCueButtonId) {
        emit('click', prefixCue.value);
    } else {
        if (props.track.Cues) {
            const clickedCue = CompilationHandler.getCueById(
                props.track.Cues,
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
        props.track.Cues?.[0]?.Time ?? null,
        false /* //TODO later allow some virtual "pre-roll" using a timer*/,
        false /* //TODO later allow some virtual "fade-ipre-roll", if defined, using a timer*/,
        prefixCueButtonId,
    );
});

const settings = useSettingsStore();
const { showInitialZeroTimeCue, showAddCueButtonInPlayView } =
    storeToRefs(settings);

const app = useAppStore();
const { selectedCueId, scheduledCueId, selectedCue } = storeToRefs(app);

/** Determines whether this cue is currently selected
 * @remarks Note: only one cue in a compilation may be selected */
function isCueSelected(cue: ICue): boolean {
    return selectedCueId.value === cue.Id;
}

/** Determines whether this cue is scheduled
 * @remarks Note: only one cue in a compilation may be scheduled */
function isCueScheduled(cue: ICue): boolean {
    return scheduledCueId.value === cue.Id;
}

/** Determines whether playback of the given cue has already passed
 * @remarks Is used for visual indication of playback progress
 * @param cue - the cue to determine the playback progress for
 */
function hasCuePassed(cue: ICue): boolean {
    return CompilationHandler.hasCuePassed(cue, currentPosition?.value);
}
/** Determines whether playback of the given cue has not yet started
 * @param cue - the cue to determine the playback progress for
 */
function isCueAhead(cue: ICue): boolean {
    return CompilationHandler.isCueAhead(cue, currentPosition?.value);
}
/** The playback progress within the given cue, in [percent], or null if not applicable
 * @param cue - the cue to determine the playback progress for
 */
function percentComplete(cue: ICue): number | null {
    return CompilationHandler.percentComplete(cue, currentPosition?.value);
}
</script>
<style lang="scss">
.cue-buttons-field.buttons {
    /* Virtual buttons should take up not unnecessary much space */
    .cue.button.is-virtual {
        max-width: 14em;
    }

    /** The cue add/remove buttons should be of equal width, 
    thus the different text is set to fixed width */
    .cue.button.is-outlined {
        min-width: 12em;
        max-width: 12em;
    }

    /** The cue add/remove buttons should be slim, 
    unused elements are set invisible */
    /** The cue add/remove buttons should be of equal width, 
    thus the different text is set to fixed width */
    .cue.button.is-outlined .icon.ml-2.mr-2.foreground {
        display: none;
    }
}
</style>
