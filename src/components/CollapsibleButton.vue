<template>
    <button
        :class="{
            button: true,
            'is-small': true,
        }"
        @click="toggleExpanded()"
        :title="titleText"
    >
        <!-- Collapsed/Expanded -->
        <ChevronDownIcon
            :class="{
                rotate: true,
                down: this.modelValue,
            }"
        />
        <span v-if="this.modelValue" class=""> {{ this.expandedText }}</span>
        <span v-else class=""> {{ this.collapsedText }} </span>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ChevronDownIcon from '@/components/icons/ChevronDownIcon.vue';

/** A button to select the collapsed or expanded state
 */
export default defineComponent({
    name: 'CollapsibleButton',
    emits: ['update:modelValue'],
    components: { ChevronDownIcon },
    props: {
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
    },
    methods: {
        toggleExpanded() {
            const expanded = !this.modelValue;
            console.debug(
                `CollapsibleButton::toggleExpanded:expanded:${expanded}`,
            );
            this.$emit('update:modelValue', expanded);
        },
    },
    computed: {
        titleText(): string {
            if (this.modelValue) {
                return 'collapse';
            }
            return 'expand';
        },
    },
});
</script>
<style scoped>
.rotate {
    -moz-transition: all 0.3s linear;
    -webkit-transition: all 0.3s linear;
    transition: all 0.3s linear;
}

.rotate.down {
    -ms-transform: rotate(180deg);
    -moz-transform: rotate(180deg);
    -webkit-transform: rotate(180deg);
    transform: rotate(180deg);
}
</style>
