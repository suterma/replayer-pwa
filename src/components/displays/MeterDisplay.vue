<template>
    <span v-if="meter" class="notranslate">
        <span v-if="meter?.BeatsPerMinute" class="is-single-line mr-3">
            <span class="has-opacity-half">BPM:&nbsp;</span>
            <span>{{ meter?.BeatsPerMinute }}</span>
        </span>
        <span v-if="meter?.TimeSignature" class="is-single-line mr-3">
            <span
                ><sup>{{ meter?.TimeSignature.Numerator }}</sup
                >/<sub>{{ meter?.TimeSignature.Denominator }}</sub></span
            >
        </span>
    </span>
</template>

<script setup lang="ts">
import type { IMeter } from '@/code/music/IMeter';
import type { PropType } from 'vue';

/** Displays a track's meter info, consisting of the BPM and time signature.
 * @remarks This component makes some layout decisions, but intentionally no size or color decisions.
 * To actually constrain the width, use e.g. "style="max-width: 25vw" on the component.
 * See also https://css-tricks.com/snippets/css/a-guide-to-flexbox/
 */

defineProps({
    /** The track's meter */
    meter: {
        type: Object as PropType<IMeter | null>,
        required: false,
        default: null,
    },
});
</script>
