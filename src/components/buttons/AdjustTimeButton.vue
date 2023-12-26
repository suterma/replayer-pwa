<template>
    <!-- Adjust time (With Hotkey for a selected item)
                Adjusting a time value should also work when this hotkey is
                invoked from inside a 
                textbox, thus explicitly no elements are excluded.-->
    <Hotkey
        :disabled="!isSelectedItem"
        :keys="['shift', 'insert']"
        :excluded-elements="[]"
        v-slot="{ clickRef }"
    >
        <!-- 
            Triggered on click or by hotkey
            @event adjustTime
        -->
        <button
            class="button"
            title="Adjusts the time to the current playback time"
            @click="$emit('adjustTime')"
            :ref="clickRef"
            data-cy="adjust-time"
        >
            <BaseIcon
                :path="isSelectedItem ? mdiTimerPlay : mdiTimerPlayOutline"
            />
            <slot></slot>
            <!-- On large screens also show an indicative text -->
            <span class="is-hidden-touch has-opacity-half">Adjust</span>
            <ShortcutDisplay
                class="is-hidden-mobile"
                :class="{ 'is-invisible': !isSelectedItem }"
            >
                <BaseIcon v-once :path="mdiAppleKeyboardShift" class="mr-1" />
                + INSERT</ShortcutDisplay
            >
        </button>
    </Hotkey>
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
/** A button that emits a specific event, intended to set or ajust a time value.
 * Also handles a hotkey, when this is marked as selected (via isSelectedItem)
 * @remarks The button does not actually handle time itself.
 * @displayName Button to ajust a time value
 */
export default defineComponent({
    name: 'AdjustTimeButton',
    components: { BaseIcon, ShortcutDisplay, Hotkey },
    emits: [
        /** Occurs, when the time should get adjusted */
        'adjustTime',
    ],
    props: {
        /** Whether this button is used for the globally selected item
         * @remarks The button should only execute the hotkey for the globally selected item */
        isSelectedItem: {
            type: Boolean,
            default: false,
            required: false,
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
