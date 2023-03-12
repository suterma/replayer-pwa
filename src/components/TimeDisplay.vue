<template>
    <span
        class="is-minimum-7-characters is-family-monospace"
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
        /** Optionally, the number of digits for the sub-second precision. Should be 1, 2, or 3 (1 is used by default).
         */
        subSecondDigits: {
            type: Number,
            required: false,
            default: 1,
        },
    },
    computed: {
        /** Converts the time into a conveniently displayable format.
         * @remarks Omits the hour part, if not applicable
         */
        currentDisplayTime(): string {
            if (!this.hasValue) {
                if (this.subSecondDigits === 3) {
                    return '--:--.---';
                } else if (this.subSecondDigits === 2) {
                    return '--:--.--';
                }
                return '--:--.-';
            }
            return CompilationHandler.convertToDisplayTime(
                this.modelValue,
                this.subSecondDigits,
            );
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
