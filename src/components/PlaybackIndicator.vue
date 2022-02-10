<template>
    <p class="control">
        <span class="button is-indicator">
            <span
                :class="{
                    icon: true,
                    'has-text-success': this.isPlaying,
                    'has-text-grey-dark': this.isReady,
                    'is-invisible': this.isUnloaded,
                }"
            >
                <i class="mdi mdi-24px">
                    <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M19,12C19,15.86 15.86,19 12,19C8.14,19 5,15.86 5,12C5,8.14 8.14,5 12,5C15.86,5 19,8.14 19,12Z"
                        />
                    </svg>
                </i>
            </span>
        </span>
    </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/** An indicator for the track playback state
 */
export default defineComponent({
    name: 'PlaybackIndicator',
    components: {},
    props: {
        /** Whether the indicator should convey the playing state */
        isPlaying: {
            type: Boolean,
            default: false,
            required: false,
        },

        /** Whether the indicator should convey the ready state */
        isReady: {
            type: Boolean,
            default: false,
            required: false,
        },
        /** Whether the indicator should convey the unloaded state */
        isUnloaded: {
            type: Boolean,
            default: true,
            required: false,
        },
    },
});
</script>
