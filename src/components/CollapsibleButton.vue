<template>
    <!-- //TODO remove transitioning, when not used, later -->
    <!-- 'is-loading': this.isTransitioning, -->

    <NavButton
        :iconClass="this.navIconClass"
        aria-haspopup="true"
        aria-controls="dropdown-menu"
        :title="this.titleText"
        iconName="chevron-down"
        @click="toggleExpanded()"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NavButton from '@/components/NavButton.vue';

/** A button to select the collapsed or expanded state
 */
export default defineComponent({
    name: 'CollapsibleButton',
    emits: ['update:modelValue'],
    components: { NavButton },
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
        /* The title*/
        title: {
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
                const addOn = this.expandedText ? `(${this.expandedText})` : '';
                return `${this.title} ${addOn}`;
            }
            const addOn = this.collapsedText ? `(${this.collapsedText})` : '';
            return `${this.title} ${addOn}`;
        },
        isTransitioning(): boolean {
            return this.requestedModelValue !== this.modelValue;
        },
        /** The dynamic class for the rotating expander button icon */
        navIconClass(): string {
            return 'rotate ' + (this.modelValue == true ? 'down' : '');
        },
    },
});
</script>
<style>
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
