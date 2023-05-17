<template>
    <!-- Create Cue (With Hotkey for the active track)
                Creating a cue should also work when invoked from inside a 
                textbox, thus explicitly no elements are excluded.-->
    <Hotkey
        :disabled="!useShortcut || disabled"
        :keys="['insert']"
        :excluded-elements="[]"
        v-slot="{ clickRef }"
    >
        <button
            class="button is-warning is-outlined"
            :class="$attrs.class"
            @click="$emit('createNewCue')"
            :ref="clickRef"
            title="Add a cue now (at the current playback time)!"
            :disabled="disabled"
            data-cy="insert-cue"
        >
            <BaseIcon v-once :path="mdiPlus" />
            <!-- On large screens also show an indicative text -->
            <span class="is-hidden-touch">Cue</span>
            <span class="has-opacity-half">&nbsp;at&nbsp;</span>
            <!-- NOTE: As a component update performance optimization, 
            the numeric value is truncated to one decimal digit, as displayed, avoiding
            unnecessary update for actually non-distinctly displayed values. -->
            <TimeDisplay
                :modelValue="
                    currentSeconds !== undefined &&
                    Number.isFinite(currentSeconds)
                        ? Math.floor(currentSeconds * 10) / 10
                        : null
                "
                :subSecondDigits="1"
            ></TimeDisplay>
            <ShortcutDisplay
                shortcut="INSERT"
                :class="{ 'is-invisible': !useShortcut }"
            ></ShortcutDisplay>
        </button>
    </Hotkey>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import ShortcutDisplay from '@/components/ShortcutDisplay.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { Hotkey } from '@simolation/vue-hotkey';
import { mdiPlus } from '@mdi/js';

/** A toggle switch for the playback mode
 * @remarks Handles and emits various states and event for playback control.
 */
export default defineComponent({
    name: 'CreateCueButton',
    components: { BaseIcon, TimeDisplay, ShortcutDisplay, Hotkey },
    emits: [
        /** Occurs, when a new cue should get created at the current playhead position.
         */
        'createNewCue',
    ],
    props: {
        /** Whether this is the active track */
        isActiveTrack: {
            type: Boolean,
            required: true,
        },
        /** Whether to show the component in a disabled state
         * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
         */
        disabled: Boolean,
        /** The playback progress in the current track, in [seconds]
         */
        currentSeconds: Number,
    },
    data() {
        return {
            /** Icons from @mdi/js */
            mdiPlus: mdiPlus,
        };
    },
    computed: {
        useShortcut(): boolean {
            return this.isActiveTrack && !this.disabled;
        },
    },
});
</script>
