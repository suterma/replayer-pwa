<template>
    <div v-if="narrow" v-bind="$attrs" class="field mb-0">
        <p class="control">
            <button
                class="button is-small is-rounded is-colorless"
                :class="{
                    'is-warning': !model,
                }"
                @click="togglePreRollMode"
            >
                <span>Pre-roll</span>
            </button>
        </p>
    </div>
    <div v-else class="field has-addons mb-0">
        <p class="control">
            <button
                class="button toggle-item is-small is-rounded is-colorless"
                :class="{
                    'is-warning': !model,
                    'is-active': !model,
                }"
                @click="togglePreRollMode"
            >
                <span>Pre-roll</span>
            </button>
        </p>
        <p class="control">
            <button
                class="button toggle-item is-small is-rounded is-colorless"
                :class="{
                    'is-warning': model,
                    'is-active': model,
                }"
                @click="togglePreRollMode"
            >
                <BaseIcon :path="rCloseCircleSmall" />
            </button>
        </p>
    </div>
</template>

<script setup lang="ts">
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { rCloseCircleSmall } from '@/components/icons/ReplayerIcon';

/** A toggle button for the omit pre-roll state. Default is false, meaning no omission
 */
const model = defineModel({ type: Boolean, default: false, required: true });

defineProps({
    /** Whether to render the menu in a narrow single-button style
     */
    narrow: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue']);

function togglePreRollMode() {
    emit('update:modelValue', !(model.value === true));
}
</script>
<style scoped>
/* On a toggle item, the active (selected) option can not be manipulated by itself, 
 * so completely remove any indication of possible action
 * NOTE: This style is similar to an acive dropdown item
 * This style might later be moved to the global styles for a new toggle-item element
 */
button.toggle-item.is-active {
    text-shadow: none;
    /* Do not handle hover, as there is nothing to activate for disabled elements */
    pointer-events: none;

    /* Active dropdown item with better suited contrast for a dark theme  */
    color: #202328;
}
</style>
