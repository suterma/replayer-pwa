<template>
    <div ref="target">
        <Hotkey
            :disabled="!dismissible || !hotkey"
            :keys="['esc']"
            :excluded-elements="[]"
            @hotkey="dismissed"
        >
        </Hotkey>
        <slot></slot>
    </div>
</template>
<script setup lang="ts">
/** A panel which can be dismissed either using the ESC key or by clicking outside of it.
 * @remarks Does not actually dismiss/hide it's content, but emits a dismissed event instead, which must get handled from the
 * surrounding component.
 * @devdoc Registers the "ESC" key as a hotkey and observes clicks outside of the area to emit the dismissed.
 */
import { ref } from 'vue';
import { Hotkey } from '@simolation/vue-hotkey';
import { onClickOutside } from '@vueuse/core';

const props = defineProps({
    /** Whether this controls actually handles the dismissal and emits the dismissed event. Default is <c>true</c> */
    dismissible: {
        type: Boolean,
        required: false,
        default: true,
    },
    /** Whether to register the ESC hotkey. */
    hotkey: {
        type: Boolean,
        required: false,
        default: false,
    },
});
const emit = defineEmits(['dismissed']);

function dismissed(): void {
    if (props.dismissible) {
        emit('dismissed');
    }
}

const target = ref(null);

onClickOutside(target, () => dismissed());
</script>
