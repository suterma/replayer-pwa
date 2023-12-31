<template>
    <div v-click-outside="dismissed">
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
<script lang="ts">
import { defineComponent } from 'vue';
import { Hotkey } from '@simolation/vue-hotkey';
/** A panel which can be dismissed either using the ESC key or by clicking outside of it.
 * @remarks Does not actually dismiss/hide it's content, but emits a dismissed event instead, which must get handled from the
 * surrounding component.
 * @devdoc Registers the "ESC" key as a hotkey and observes clicks outside of the area to emit the dismissed.
 */
export default defineComponent({
    name: 'DismissiblePanel',
    components: { Hotkey },
    props: {
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
    },
    emits: ['dismissed'],
    methods: {
        dismissed(): void {
            if (this.dismissible) {
                this.$emit('dismissed');
            }
        },
    },
});
</script>
