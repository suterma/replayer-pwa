<template>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label is-single-line" v-bind="$attrs">{{
                label
            }}</label>
        </div>
        <div class="field-body">
            <!-- Note: the additional addon class is non-disturbing if no actual addon item is rendered -->
            <div class="field has-addons">
                <div class="control">
                    <!-- The slot for the actual input control -->
                    <slot></slot>
                </div>
                <!-- The slot for the possible addon -->
                <slot name="addon"></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

/**
 * An input control with a label
 * @remarks This is to be used for arbitrary inputs, with the bulma layout. It also supports an addon-slot, positioned after the input.
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
