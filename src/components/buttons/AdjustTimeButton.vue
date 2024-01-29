<template>
    <!-- Adjust time (With Hotkey for a selected item)
                Adjusting a time value should also work when this hotkey is
                invoked from inside a 
                textbox, thus explicitly no elements are excluded.-->
    <Hotkey
        v-slot="{ clickRef }"
        :disabled="!isSelectedItem"
        :keys="['shift', 'insert']"
        :excluded-elements="[]"
        @hotkey="message.pushInputFeedback('SHIFT+INSERT', 'Adjust')"
    >
        <!-- 
            Triggered on click or by hotkey
            @event adjustTime
        -->
        <button
            :ref="clickRef"
            class="button"
            title="Adjusts the time to the current playback time"
            data-cy="adjust-time"
            @click="$emit('adjustTime')"
        >
            <!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC -->
            <i class="icon mdi mdi-24px">
                <svg viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        :d="isSelectedItem ? mdiTimerPlay : mdiTimerPlayOutline"
                    />
                </svg>
            </i>
            <slot></slot>
            <!-- On large screens also show an indicative text -->
            <span class="is-hidden-touch has-opacity-half">Adjust</span>
            <ShortcutDisplay :class="{ 'is-invisible': !isSelectedItem }">
                <!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC -->
                <i class="icon mdi mdi-24px mr-1">
                    <svg viewBox="0 0 24 24">
                        <path fill="currentColor" :d="mdiAppleKeyboardShift" />
                    </svg>
                </i>
                + INSERT</ShortcutDisplay
            >
        </button>
    </Hotkey>
</template>

<script setup lang="ts">
import ShortcutDisplay from '@/components/ShortcutDisplay.vue';
import { Hotkey } from '@simolation/vue-hotkey';
import {
    mdiTimerPlay,
    mdiTimerPlayOutline,
    mdiAppleKeyboardShift,
} from '@mdi/js';
import { useMessageStore } from '@/store/messages';
/** A button that emits a specific event, intended to set or ajust a time value.
 * Also handles a hotkey, when this is marked as selected (via isSelectedItem)
 * @remarks The button does not actually handle time itself.
 * @displayName Button to ajust a time value
 */

const props = defineProps({
    /** Whether this button is used for the globally selected item
     * @remarks The button should only execute the hotkey for the globally selected item */
    isSelectedItem: {
        type: Boolean,
        default: false,
        required: false,
    },
});

const emit = defineEmits([
    /** Occurs, when the time should get adjusted */
    'adjustTime',
]);

const message = useMessageStore();
</script>
