<template>
    <!-- //TODO remove transitioning, when not used, later -->
    <!-- 'is-loading': this.isTransitioning, -->
    <button
        :class="{
            button: true,
            'is-nav': true,
            'is-small': true,
        }"
        @click="toggleExpanded()"
        :title="titleText"
    >
        <!-- Collapsed/Expanded -->
        <Icon
            name="chevron-down"
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
import Icon from '@/components/icons/Icon.vue';

/** A button to select the collapsed or expanded state
 */
export default defineComponent({
    name: 'CollapsibleButton',
    emits: ['update:modelValue'],
    components: { Icon },
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
    data() {
        return {
            requestedModelValue: this.modelValue,
        };
    },
    methods: {
        toggleExpanded() {
            this.requestedModelValue = !this.modelValue;
            console.debug(
                `CollapsibleButton::toggleExpanded:requestedModelValue:${this.requestedModelValue}`,
            );
            this.$emit('update:modelValue', this.requestedModelValue);
        },
    },
    computed: {
        titleText(): string {
            if (this.modelValue) {
                return 'collapse';
            }
            return 'expand';
        },
        isTransitioning(): boolean {
            return this.requestedModelValue !== this.modelValue;
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
