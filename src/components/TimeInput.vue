<template>
    <input
        type="number"
        inputmode="decimal"
        :step="step"
        :value="modelValue"
        @change="immediatelyUpdateTime($event)"
        @paste="immediatelyUpdateTime($event)"
        @input="debouncedHandler($event)"
        placeholder="time [seconds]"
        size="5"
        data-cy="input-cue-position"
    />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import CompilationHandler from '@/store/compilation-handler';
import debounce from 'lodash.debounce';

/** An input for a time value in [seconds]
 * @remarks Debounces on typed user input (not debouncing when using the spinner buttons)
 */
export default defineComponent({
    name: 'TimeInput',
    emits: ['change'],
    props: {
        modelValue: {
            type: null as unknown as PropType<number | null>,
            default: null,
        },
        /** The step size of the numerical input (0.1 is default) */
        step: {
            type: Number,
            default: 0.1,
            required: false,
        },
    },

    setup() {
        const debouncedHandler = null as any;
        return {
            debouncedHandler,
        };
    },

    created() {
        this.debouncedHandler = debounce((event: Event): void => {
            this.updateTime(event);
        }, 600);
    },
    beforeUnmount() {
        this.debouncedHandler.cancel();
    },
    methods: {
        /** Updates the set cue time immediately, canceling any running debounce */
        immediatelyUpdateTime(event: Event) {
            this.debouncedHandler.cancel();
            this.updateTime(event);
        },

        /** Updates the set cue time after debouncing */
        debouncedUpdateTime(event: Event) {
            this.debouncedHandler = debounce(() => {
                this.updateTime(event);
            }, 600);
        },
        /** Updates the set cue time */
        updateTime(event: Event) {
            const time = CompilationHandler.roundTime(
                parseFloat((event.target as HTMLInputElement).value),
            );
            if (this.modelValue != time) {
                if (!Number.isFinite(time)) {
                    this.$emit('change', null);
                } else {
                    this.$emit('change', time);
                }
            }
        },
    },
});
</script>
