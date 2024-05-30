<template>
    <div class="field has-addons">
        <p class="control">
            <button
                class="button toggle-item is-small is-rounded"
                :class="{
                    'is-active': !model,
                    'is-selected': !model,
                    'is-light': !model,
                }"
                :disabled="!model"
                @click="togglePreRollMode"
            >
                <span>Pre-roll</span>
            </button>
        </p>
        <p class="control">
            <button
                class="button toggle-item is-small is-rounded"
                :class="{
                    'is-active': model,
                    'is-selected': model,
                    'is-light': model,
                }"
                :disabled="model"
                @click="togglePreRollMode"
            >
                <span>off</span>
            </button>
        </p>
    </div>
</template>

<script setup lang="ts">
/** A toggle button for the omit pre-roll state. Default is false, meaning no omission
 */
const model = defineModel({ type: Boolean, default: false, required: true });

const emit = defineEmits(['update:modelValue']);

function togglePreRollMode() {
    emit('update:modelValue', !(model.value === true));
}
</script>
<style scoped>
/* The active (selected) option can not be manipulated by theirselves, so completely remove any indication of possible action
 * NOTE: This style is similar to an acive dropdown item
 * This style might later be moved to the global styles for a new toggle-item element
 */
button.toggle-item.is-active:disabled {
    text-shadow: none;
    /* Do not handle hover, as there is nothing to activate for disabled elements */
    pointer-events: none;
}

/* Active dropdown item with better suited contrast for a dark theme
 * NOTE: This style is similar to an acive dropdown item
 * This style might later be moved to the global styles for a new toggle-item element
 */
button.toggle-item.is-active {
    color: #202328;
}
</style>
