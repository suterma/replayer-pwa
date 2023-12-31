<template>
    <!-- Create Cue (With Hotkey for the active track)
                Creating a cue should also work when invoked from inside a 
                textbox, thus explicitly no elements are excluded.-->
    <Hotkey
        v-slot="{ clickRef }"
        :disabled="!useShortcut || disabled"
        :keys="['insert']"
        :excluded-elements="[]"
    >
        <button
            :ref="clickRef"
            class="button is-warning is-outlined"
            :class="$attrs.class"
            title="Add a cue now (at the current playback time)!"
            :disabled="disabled"
            data-cy="insert-cue"
            @click="emit('createNewCue')"
        >
            <BaseIcon v-once :path="mdiPlus" />
            <!-- On large screens also show an indicative text -->
            <span class="is-hidden-touch">Cue</span>
            <span class="has-opacity-half">&nbsp;at&nbsp;</span>
            <span class="is-minimum-7-characters is-family-monospace">{{
                currentPositionDisplay
            }}</span>
            <ShortcutDisplay
                 :class="{ 'is-invisible': !useShortcut }"
            >INSERT</ShortcutDisplay>
        </button>
    </Hotkey>
</template>

<script setup lang="ts">
/** A toggle switch for the playback mode
 * @remarks Handles and emits various states and event for playback control.
 */
import ShortcutDisplay from '@/components/ShortcutDisplay.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { Hotkey } from '@simolation/vue-hotkey';
import { mdiPlus } from '@mdi/js';
import { computed, inject } from 'vue';
import { currentPositionDisplayInjectionKey } from '../track/TrackInjectionKeys';

const emit = defineEmits([
    /** Occurs, when a new cue should get created at the current playhead position.
     */
    'createNewCue',
]);

const props = defineProps({
    /** Whether this is the active track */
    isActiveTrack: {
        type: Boolean,
        required: true,
    },
    /** Whether to show the component in a disabled state
     * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
     */
    disabled: Boolean,
});
const useShortcut = computed(() => {
    return props.isActiveTrack && !props.disabled;
});

const currentPositionDisplay = inject(currentPositionDisplayInjectionKey);
</script>
