<template>
    <!-- Create Cue (With Hotkey for the active track)
                Creating a cue should also work when invoked from inside a 
                textbox, thus explicitly no elements are excluded.
                NOTE: Using the ":enabled" property on Hotkey does not work
                See https://github.com/Simolation/vue-hotkey/issues/2 -->
    <Hotkey
        v-if="isActiveTrack"
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
        >
            <BaseIcon v-once :path="mdiPlus" />
            <!-- On large screens also show an indicative text -->
            <span class="is-hidden-touch">Cue</span>
            <span class="has-opacity-half">&nbsp;at&nbsp;</span>
            <TimeDisplay :modelValue="currentSeconds"></TimeDisplay>
            <ShortcutDisplay v-once shortcut="INSERT"></ShortcutDisplay>
        </button>
    </Hotkey>
    <button
        v-else
        class="button is-warning is-outlined"
        :class="$attrs.class"
        @click="$emit('createNewCue')"
        title="Add a cue now (at the current playback time)!"
    >
        <BaseIcon v-once :path="mdiPlus" />
        <!-- On large screens also show an indicative text -->
        <span class="is-hidden-touch">Cue</span>
        <span class="has-opacity-half">&nbsp;at&nbsp;</span>
        <TimeDisplay :modelValue="currentSeconds"></TimeDisplay>
    </button>
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
});
</script>
