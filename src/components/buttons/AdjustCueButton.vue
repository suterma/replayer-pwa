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
            <BaseIcon v-once name="timer-sync-outline" />
            <!-- On large screens also show an indicative text -->
            <span class="is-hidden-touch has-opacity-half">Adjust</span>
            <ShortcutDisplay v-once
            class=" is-hidden-touch is-hidden-desktop-only"
                ><svg
                    class="mr-1"
                    style="width: 18px; height: 18px"
                    viewBox="0 0 24 24"
                >
                    <path
                        fill="currentColor"
                        d="M15,18V12H17.17L12,6.83L6.83,12H9V18H15M12,4L22,14H17V20H7V14H2L12,4Z"
                    /></svg
                >+ INSERT</ShortcutDisplay
            >
        </button>
    </Hotkey>
    <button
        v-else
        class="button"
        title="Adjusts the cue time to the current playback time"
        @click="$emit('adjustCue')"
    >
        <BaseIcon v-once name="timer-sync-outline" />
        <!-- On large screens also show an indicative text -->
        <span class="is-hidden-touch has-opacity-half">Adjust</span>
        <!-- Show the inert shortcut as a placeholder, to keep the layout unchanged
        on cue selection changes -->
        <ShortcutDisplay v-once class="is-invisible        is-hidden-touch is-hidden-desktop-only"

            ><svg
                class="mr-1"
                style="width: 18px; height: 18px"
                viewBox="0 0 24 24"
            >
                <path
                    fill="currentColor"
                    d="M15,18V12H17.17L12,6.83L6.83,12H9V18H15M12,4L22,14H17V20H7V14H2L12,4Z"
                /></svg
            >+ INSERT</ShortcutDisplay
        >
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ShortcutDisplay from '@/components/ShortcutDisplay.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { Hotkey } from '@simolation/vue-hotkey';
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
});
</script>
