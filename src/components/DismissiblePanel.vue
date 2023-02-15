<template>
    <div v-click-outside="dismissed">
        <!-- The Hotkey needs to be enabled/disabled using v-if, not with it's own enabled property
        See https://github.com/Simolation/vue-hotkey/issues/2  -->
        <Hotkey
            v-if="dismissible"
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
/** A panel which can be dismissed either using the ESC key or by clicking outside
 */
export default defineComponent({
    name: 'DismissiblePanel',
    components: { Hotkey },
    emits: ['dismissed'],
    props: {
        /** Whether this controls actually handles the dismissal and emits the dismissed event. Default is <c>true</c> */
        dismissible: {
            type: Boolean,
            required: false,
            default: true,
        },
    },
    methods: {
        dismissed(): void {
            if (this.dismissible) {
                this.$emit('dismissed');
            }
        },
    },
});
</script>
