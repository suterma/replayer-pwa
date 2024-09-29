<template>
    <!-- Narrow style has only one toggle switch -->
    <div v-if="narrow" v-bind="$attrs" class="field mb-0">
        <p class="control">
            <button
                class="button is-small is-rounded is-colorless"
                :class="{
                    'is-warning': !model,
                }"
                @click="toggleFadeInMode"
            >
                <span>Fade-in</span>
            </button>
        </p>
    </div>
    <!-- wider variant has two distinct styles -->
    <div v-else v-bind="$attrs" class="field has-addons mb-0">
        <!-- On a toggle item, the active (selected) option can not be manipulated by itself, 
        so completely remove any indication of possible action
        NOTE: This style is similar to an acive dropdown item -->
        <p class="control">
            <button
                class="button toggle-item is-small is-rounded is-colorless"
                :class="{
                    'is-warning': !model,
                    'is-static': !model,
                    'has-text-dark': !model,
                }"
                @click="toggleFadeInMode"
            >
                <span>Fade-in</span>
            </button>
        </p>
        <p class="control">
            <button
                class="button toggle-item is-small is-rounded is-colorless"
                :class="{
                    'is-warning': model,
                    'is-static': model,
                    'has-text-dark': model,
                }"
                @click="toggleFadeInMode"
            >
                <BaseIcon :path="rCloseCircleSmall" />
            </button>
        </p>
    </div>
</template>

<script setup lang="ts">
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { rCloseCircleSmall } from '@/components/icons/ReplayerIcon';

/** A toggle button for the omit fade-in state. Default is false, meaning no omission
 * @devdoc
 *
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

function toggleFadeInMode() {
    emit('update:modelValue', !(model.value === true));
}
</script>
