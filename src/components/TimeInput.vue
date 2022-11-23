<template>
    <input
        type="number"
        inputmode="decimal"
        step="0.1"
        :value="modelValue"
        @change="debouncedHandler($event)"
        @input="debouncedHandler($event)"
        placeholder="time [seconds]"
        size="5"
    />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import CompilationHandler from '@/store/compilation-handler';
import debounce from 'lodash.debounce';

/** An input for a time value in [seconds]
 * @remarks Debounces on user input
 */
export default defineComponent({
    name: 'TimeInput',
    emits: ['change'],
    props: {
        modelValue: {
            type: null as unknown as PropType<number | null>,
            default: null,
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
            console.debug('TimeInput::New value:', event.target);
            this.updateTime(event);
        }, 300);
    },
    beforeUnmount() {
        this.debouncedHandler.cancel();
    },
    methods: {
        /** Updates the set cue time after debouncing */
        debouncedUpdateTime(event: Event) {
            console.debug('TimeInput::debouncing...', event);

            debounce(() => {
                this.updateTime(event);
            }, 300);
        },
        /** Updates the set cue time */
        updateTime(event: Event) {
            const time = CompilationHandler.roundTime(
                parseFloat((event.target as HTMLInputElement).value),
            );

            if (!Number.isFinite(time)) {
                console.debug('TimeInput::change', null);
                this.$emit('change', null);
            } else {
                console.debug('TimeInput::change', time);
                this.$emit('change', time);
            }
        },
    },
});
</script>
