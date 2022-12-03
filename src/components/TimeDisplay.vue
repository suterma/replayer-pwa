<template>
    <span
        class="is-minimum-7-characters"
        :class="{
            'is-invisible': hidePlaceholder && !hasValue,
        }"
        >{{ currentDisplayTime }}</span
    >
</template>

<script lang="ts">
import CompilationHandler from '@/store/compilation-handler';
import { defineComponent, PropType } from 'vue';

/** A display for a time value in the h:mm:ss.z format
 */
export default defineComponent({
    name: 'TimeDisplay',
    props: {
        modelValue: {
            type: null as unknown as PropType<number | null>,
            default: null,
        },
        /** Whether to hide the placeholder for empty values */
        hidePlaceholder: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    computed: {
        /** Converts the time into a conveniently displayable format.
         * @remarks Omits the hour part, if not applicable
         */
        currentDisplayTime(): string {
            if (!this.hasValue) {
                return '--:--.-';
            }
            return CompilationHandler.convertToDisplayTime(this.modelValue, 1);
        },
        /** Whether a time value is available for display.
         * @remarks null, undefined and other non finite values return false.
         */
        hasValue(): boolean {
            return Number.isFinite(this.modelValue);
        },
    },
});
</script>