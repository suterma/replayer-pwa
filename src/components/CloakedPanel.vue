<template>
    <DismissiblePanel @dismissed="cloak" :dismissible="dismissible">
        <CollapsibleButton
            v-show="!modelValue && !shouldReveal"
            class="is-nav"
            :modelValue="modelValue"
            @update:modelValue="() => reveal()"
            collapsedText="Click to reveal"
            :iconPath="mdiPlus"
            :title="title"
            v-bind="$attrs"
            ><span><slot name="caption"></slot></span
        ></CollapsibleButton>
        <!-- Transition for the revealing action. 
        Uses an additional element to make sure that there is a single root within the transition slot -->
        <Transition name="item-expand-right">
            <div
                class="transition-in-place"
                v-if="modelValue || shouldReveal"
                :title="title"
                v-bind="$attrs"
                ref="slotContainer"
            >
                <slot></slot>
            </div>
        </Transition>
    </DismissiblePanel>
</template>
<script setup lang="ts">
/** A panel with an one-off expander button that triggers the expansion state of the slotted content.
 * The content is by default cloaked again by either pressing "ESC" or clicking outside, if none of the
 * conditions of the "reveal-for" property apply
 * @remarks Works similar to the "CollapsiblePanel" component, with some differences:
 * The caption and icon is only shown when the content is collapsed/cloaked.
 * @remarks the v-if directive is used, completely omitting collapsed content, if not displayed.
 * @remarks When the content is reveald by user action, the first input is focused
 */
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import { mdiPlus } from '@mdi/js';
import { PropType, computed, ref } from 'vue';
import { nextTick } from 'process';
import DismissiblePanel from '@/components/DismissiblePanel.vue';

/** Whether to show this panel as expanded */
const modelValue = ref(false);

const slotContainer = ref(null);

/** Reveals the cloaked content
 * @remarks Also focuses the first input, if existings
 */
function reveal() {
    modelValue.value = true;

    // Since any components might not be rendered until the next DOM update,
    // defer the actual focussing
    // See https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/Vue_refs_focus_management#vues_nexttick_method
    nextTick(() => {
        if (slotContainer.value) {
            const slotContainerDiv = slotContainer.value as HTMLDivElement;
            const firstInput =
                slotContainerDiv.getElementsByTagName('input')[0];
            if (firstInput) {
                firstInput.focus();
            }
        }
    });
}

/** Cloaks the revealed content
 */
function cloak() {
    modelValue.value = false;
}

// eslint-disable-next-line no-undef
const props = defineProps({
    /** The values to reveal this panel for, if any of them are set
     */
    revealFor: Array as PropType<Array<unknown>>,

    /** The title
     * @remarks This text is show as title for the label in both the cloaked and the revealed state
     *  */
    title: {
        type: String,
        default: '',
    },

    /** Whether this controls actually handles the dismissal and emits the dismissed event. Default is <c>true</c> */
    dismissible: {
        type: Boolean,
        required: false,
        default: true,
    },
});

/** Whether the panel should be revealed based on available content. */
const shouldReveal = computed(() => {
    if (!props.revealFor) return false;

    const hasContent = props.revealFor.filter((item) => {
        // explicit check for boolean
        if (typeof item == 'boolean') {
            return item;
        }

        // simple thruthiness check for others
        return item ? true : false;
    });
    return hasContent.length > 0 ?? false;
});
</script>
