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
            :class="{
                button: true,
                'is-warning': true,
            }"
            @click="$emit('createNewCue')"
            :ref="clickRef"
            title="Create a cue now (at the current playback time)!"
        >
            <BaseIcon name="plus" />
            <span>Create Cue! [INSERT]</span>
        </button>
    </Hotkey>
    <button
        v-else
        :class="{
            button: true,
            'is-warning': true,
        }"
        @click="$emit('createNewCue')"
        title="Create a cue now (at the current playback time)!"
    >
        <BaseIcon name="plus" />
        <span>Create Cue!</span>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { Hotkey } from '@simolation/vue-hotkey';
/** A toggle switch for the playback mode
 * @remarks Handles and emits various states and event for playback control.
 */
export default defineComponent({
    name: 'CreateCueButton',
    components: { BaseIcon, Hotkey },
    emits: [
        /** Occurs, when a new cue should get created at the current playhead position.
         */
        'createNewCue',
    ],
    props: {
        /** Whether whether this is the active track (i.e. the globally selected cue is from this track ) */
        isActiveTrack: {
            type: Boolean,
            required: true,
        },
    },
    computed: {},
    methods: {},
});
</script>
