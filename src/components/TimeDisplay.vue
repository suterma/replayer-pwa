<template>
    <span class="is-minimum-7-characters is-family-monospace">{{
        currentDisplayTime(modelValue)
    }}</span>
</template>

<script lang="ts">
import CompilationHandler from '@/store/compilation-handler';
import { defineComponent, type PropType } from 'vue';

/** A display for a time value in the h:mm:ss.z format
 */
export default defineComponent({
    name: 'TimeDisplay',
    props: {
        modelValue: {
            type: null as unknown as PropType<number | null>,
            default: null,
        },
        /** Optionally, the number of digits for the sub-second precision. Should be 1, 2, or 3 (1 is used by default).
         */
        subSecondDigits: {
            type: Number,
            required: false,
            default: 1,
        },
    },
    methods: {
        /** Converts the time into a conveniently displayable format.
         * @remarks Omits the hour part, if not applicable
         */
        currentDisplayTime(value: number | null): string {
            return CompilationHandler.convertToDisplayTime(
                value,
                this.subSecondDigits,
            );
        },
    },
});
</script>
