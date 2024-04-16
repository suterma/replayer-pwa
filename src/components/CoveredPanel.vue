<template>
    <!-- NOTE: The hotkey is only registered for the single (focused) revealed panel 
    that is currently revealed explicitly (for editing purposes). This way, only ever
    one hotkey is registered on the page. Multiple registered same hotkeys are not possible-->
    <DismissiblePanel
        :dismissible="dismissible"
        :hotkey="!isCovered && !hasContentToRevealFor"
        @dismissed="cover"
    >
        <CollapsibleButton
            v-show="isCovered"
            :icon-path="iconPath"
            class="is-nav"
            :model-value="isRevelationRequested"
            collapsed-text="Click to reveal"
            :title="title"
            v-bind="$attrs"
            :disabled="disabled"
            @update:model-value="() => reveal()"
            ><span><slot name="caption"></slot></span
        ></CollapsibleButton>
        <!-- Transition for the revealing action. 
        Uses an additional element to make sure that there is a single root within the transition slot -->
        <Transition :name="transitionName">
            <div
                v-if="!isCovered"
                v-bind="$attrs"
                ref="slotContainer"
                class="transition-in-place"
                :title="title"
            >
                <slot></slot>
            </div>
        </Transition>
    </DismissiblePanel>
</template>
<script setup lang="ts">
/** A panel with a reveal button that triggers the render state of the slotted content.
 * The content is by default covered again by either pressing "ESC" or clicking outside, if none of the
 * conditions of the "reveal-for" property apply
 * @remarks Works similar to the "CollapsiblePanel" component, with some differences:
 * - The caption and icon is only shown when the content is covered.
 * - the v-if directive is used, completely omitting covered content.
 * - When the content is reveald by user action, the first input is focused
 * @remarks A parent component can explicitly cover and reveal the content via
 * exposed functions
 */
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import { type PropType, computed, ref, nextTick } from 'vue';
import DismissiblePanel from '@/components/DismissiblePanel.vue';
import { mdiPlus } from '@mdi/js';

/** Whether to show this panel as revealed is requested */
const isRevelationRequested = ref(false);

const slotContainer = ref(null);

/** Explicitly reveals the covered content
 * @remarks Also focuses the first input, if existings
 */
function reveal() {
    isRevelationRequested.value = true;

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

/** Explicitly covers the revealed content
 * @remarks If any content is available to reveal for, it will override this intention
 */
function cover() {
    isRevelationRequested.value = false;
}

// eslint-disable-next-line no-undef
const props = defineProps({
    /** The values to reveal this panel for, if any of them are set
     */
    revealFor: {
        type: Array as PropType<Array<unknown> | undefined>,
        default: undefined,
    },

    /** The icon path, if any. Default is mdiPlus */
    iconPath: {
        type: String,
        default: mdiPlus,
    },

    /** The name of the transition to use for revealing
     * @remarks Default is "item-expand-right"
     *  */
    transitionName: {
        type: String,
        default: 'item-expand-right',
    },

    /** The title
     * @remarks This text is show as title for the label in both the covered and the revealed state
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
    /** Whether to show the component in a disabled state
     */
    disabled: Boolean,
});

/** Whether the panel should be revealed based on available content. */
const hasContentToRevealFor = computed(() => {
    if (!props.revealFor) return false;

    const hasContent = props.revealFor.filter((item) => {
        // explicit check for boolean
        if (typeof item == 'boolean') {
            return item;
        }

        // simple thruthiness check for others
        return item ? true : false;
    });
    return hasContent?.length ?? 0 > 0;
});

/** Whether the panel is actually covered. */
const isCovered = computed(() => {
    return !(isRevelationRequested.value || hasContentToRevealFor.value);
});

/** A parent component should be able to cover and reveal, if needed */
defineExpose({
    reveal,
    cover,
});
</script>
