<template>
    <span
        :class="{
            'is-invisible': hidePlaceholder && modelValue === null,
            'is-minimum-9-characters': !isNarrow,
            'is-minimum-7-characters': isNarrow,
        }"
        >{{ currentDisplayTime }}</span
    >
</template>

<script lang="ts">
import CompilationHandler from '@/store/compilation-handler';
import { defineComponent, PropType } from 'vue';

/** A display for a time value in the h:mm:ss.zzz format
 * @remarks Adapts the milliseconds precision according to the viewport width
 */
export default defineComponent({
    name: 'PlayerTime',
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
            if (this.isNarrow) {
                if (this.modelValue === null) {
                    return '--:--.-';
                }
                return CompilationHandler.convertToDisplayTime(
                    this.modelValue,
                    1,
                );
            } else {
                if (this.modelValue === null) {
                    return '--:--.---';
                }

                return CompilationHandler.convertToDisplayTime(this.modelValue);
            }
        },
        /** Whether the viewport width at or below Bulma's mobile breakpoint
         * @remarks Is not reactive, which is a good thing to save CPU cycles
         */
        isNarrow() {
            return true;
            //Currently always process as narrow
            //  if (document.body.clientWidth <= 768 /* isMobile by Bulma */) {
            //     return true;
            // } else {
            //     return false;
            // }
        },
    },
});
</script>
<style scoped>
.is-minimum-9-characters {
    min-width: 9ch;
}
.is-minimum-7-characters {
    min-width: 7ch;
}
</style>
