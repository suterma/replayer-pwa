<template>
    <div class="buttons has-addons is-centered">
        <!-- Off -->
        <button
            :class="{
                button: true,
                'is-small': true,
                'is-outlined': this.modelValue,
                'is-primary': true,
                'is-selected': !this.modelValue,
            }"
            @click="toggleOn()"
            :title="offText"
        >
            <span> {{ this.offText }}</span>
        </button>
        <!-- On -->
        <button
            :class="{
                button: true,
                'is-small': true,
                'is-outlined': !this.modelValue,
                'is-primary': true,
                'is-selected': this.modelValue,
            }"
            @click="toggleOn()"
            :title="onText"
        >
            <span> {{ this.onText }}</span>
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/** A toggling button to select an on or off state
 */
export default defineComponent({
    name: 'ToggleButton',
    emits: ['update:modelValue'],
    components: {},
    props: {
        /** Whether this represents the on state. */
        modelValue: {
            type: Boolean,
            default: false,
        },
        onText: {
            type: String,
            default: '',
        },
        offText: {
            type: String,
            default: '',
        },
    },
    methods: {
        toggleOn() {
            const state = !this.modelValue;
            console.debug(`ToggleButton::toggleExpanded:state:${state}`);
            this.$emit('update:modelValue', state);
        },
    },
});
</script>
