<template>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label is-single-line" v-bind="$attrs">{{
                label
            }}</label>
        </div>
        <div class="field-body">
            <div class="field">
                <p class="control">
                    <slot></slot>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * An input with a label
 * @devdoc This is to be used for arbitrary inputs, with the bulma layout.
 */
defineProps({
    /**
     * The label text
     */
    label: {
        type: String,
        required: false,
        default: '',
    },
});
</script>
