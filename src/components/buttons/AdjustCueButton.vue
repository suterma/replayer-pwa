<template>
    <!-- Create Cue (With Hotkey for the active track)
                Creating a cue should also work when invoked from inside a 
                textbox, thus explicitly no elements are excluded.
                NOTE: Using the ":enabled" property on Hotkey does not work
                See https://github.com/Simolation/vue-hotkey/issues/2 -->
    <Hotkey
        v-if="isSelectedCue"
        :keys="['shift', 'insert']"
        :excluded-elements="[]"
        v-slot="{ clickRef }"
    >
        <button
            class="button"
            title="Adjusts the cue time to the current playback time"
            @click="$emit('adjustCue')"
            :ref="clickRef"
        >
            <BaseIcon v-once :path="mdiTimerPlay" />
            <!-- On large screens also show an indicative text -->
            <span class="is-hidden-touch has-opacity-half">Adjust</span>
            <ShortcutDisplay v-once>
                <BaseIcon v-once :path="mdiAppleKeyboardShift" class="mr-1" />
                + INSERT</ShortcutDisplay
            >
        </button>
    </Hotkey>
    <button
        v-else
        class="button"
        title="Adjusts the cue time to the current playback time"
        @click="$emit('adjustCue')"
    >
        <BaseIcon v-once :path="mdiTimerPlayOutline" />
        <!-- On large screens also show an indicative text -->
        <span class="is-hidden-touch has-opacity-half">Adjust</span>
        <!-- Show the inert shortcut as a placeholder, to keep the layout unchanged
        on cue selection changes -->
        <ShortcutDisplay v-once class="is-invisible">
            <BaseIcon v-once :path="mdiAppleKeyboardShift" class="mr-1" />
            + INSERT</ShortcutDisplay
        >
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ShortcutDisplay from '@/components/ShortcutDisplay.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { Hotkey } from '@simolation/vue-hotkey';
import {
    mdiTimerPlay,
    mdiTimerPlayOutline,
    mdiAppleKeyboardShift,
} from '@mdi/js';
/** A toggle switch for the playback mode
 * @remarks Handles and emits various states and event for playback control.
 */
export default defineComponent({
    name: 'AdjustCueButton',
    components: { BaseIcon, ShortcutDisplay, Hotkey },
    emits: [
        /** Occurs, when the cue should get adjusted to the the current playhead position.
         */
        'adjustCue',
    ],
    props: {
        /** Whether this button is for the globally selected cue (The button should only execute the hotkey for the globally selected cue ) */
        isSelectedCue: {
            type: Boolean,
            required: true,
        },
    },
    data() {
        return {
            /** Icons from @mdi/js */
            mdiTimerPlay: mdiTimerPlay,
            mdiTimerPlayOutline: mdiTimerPlayOutline,
            mdiAppleKeyboardShift: mdiAppleKeyboardShift,
        };
    },
});
</script>
