<template>
    <NavButton
        :icon-class="navIconClass"
        aria-haspopup="true"
        aria-controls="dropdown-menu"
        :title="titleText"
        :icon-path="iconPath"
        :disabled="disabled"
        @click="toggleExpanded()"
        ><slot></slot
    ></NavButton>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import NavButton from '@/components/buttons/NavButton.vue';
import { mdiChevronDown } from '@mdi/js';

/** A button to display and toggle a collapsed or expanded state, using a directed chevron icon.
 * @remarks The default (expanded) chevron direction is down.
 */
const props = defineProps({
    /** Whether this represents the expanded state. */
    modelValue: {
        type: Boolean,
        default: false,
    },
    expandedText: {
        type: String,
        default: '',
    },
    collapsedText: {
        type: String,
        default: '',
    },
    /** The icon path, if any. Default is mdiChevronDown */
    iconPath: {
        type: String,
        default: mdiChevronDown,
    },
    /** The direction of the icon for the collapsed state: either 'right' (default), 'left', or 'up' */
    collapsedChevronDirection: {
        required: false,
        type: String,
        default: 'right',
    },
    /** The title
     * @remarks This text is show as title for the label in both the collapsed and expanded state
     *  */
    title: {
        type: String,
        default: '',
    },
    /** Whether to show the component in a disabled state
     */
    disabled: Boolean,
});

const emit = defineEmits(['update:modelValue']);

const titleText = computed(() => {
    if (props.modelValue) {
        const addOn = props.expandedText ? `(${props.expandedText})` : '';
        return `${props.title} ${addOn}`;
    }
    const addOn = props.collapsedText ? `(${props.collapsedText})` : '';
    return `${props.title} ${addOn}`;
});

/** The dynamic class for the rotating expander button icon */
const navIconClass = computed(() => {
    return (
        'rotate ' +
        (props.modelValue == true ? 'down' : props.collapsedChevronDirection)
    );
});

function toggleExpanded() {
    const requestedModelValue = !props.modelValue;
    emit('update:modelValue', requestedModelValue);
}
</script>
