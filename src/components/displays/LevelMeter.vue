<!-- Taken from https://github.com/suterma/vue-audio-level-meter/blob/main/src/components/LevelMeter.vue (MIT-Licensed) -->
<!-- Credits: https://web.replayer.app/#/about -->
<!-- This code has been slightly adapted for the Replayer project -->
<template>
    <meter
        v-element-size="onResize"
        :min="minLevel"
        :low="lowLevel"
        :high="highLevel"
        :max="maxLevel"
        :value="value"
    ></meter>
</template>

<script setup lang="ts">
import { vElementSize } from '@vueuse/components';
import { ref, computed } from 'vue';

/** An simple level meter, with three distinct ranges.
 * @remarks Internally uses the <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meter">HTML meter element</a>,
 * with the min, low, high and max level as exposed properties.
 * @remarks For the CSS classes see https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-meter-bar
 * With this component, coloring is however different, offering a different color per range.
 */

const props = defineProps({
    /** The minimum level */
    minLevel: {
        type: Number,
        required: true,
    },

    /** The low range color (between minimum level and low level) */
    lowRangeColor: {
        type: String,
        required: false,
        default: '#62c462',
    },

    /** The low level */
    lowLevel: {
        type: Number,
        required: true,
    },

    /** The mid range color (between low level and high level) */
    midRangeColor: {
        type: String,
        required: false,
        default: '#f9e406',
    },

    /** The high level */
    highLevel: {
        type: Number,
        required: true,
    },

    /** The high range color (between high level and maximum level) */
    highRangeColor: {
        type: String,
        required: false,
        default: '#ee5f5b',
    },

    backgroundColor: {
        type: String,
        required: false,
        default: '#000000',
    },

    /** The maximum level */
    maxLevel: {
        type: Number,
        required: true,
    },

    /** The level value */
    value: {
        type: Number,
        required: true,
    },
});

/** The styles for the meter range element are dynamically calculated to be able to
 * use a pixel-defined gradient. This makes the gradient regions visually fixed with regard to the meter scale
 * (non-dependent from the actual meter value)
 * @devdoc See https://stackoverflow.com/a/69078238/79485 for the v-bind mechanism
 */
const meterWidth = ref(100);

function onResize({ width }: { width: number; height: number }) {
    meterWidth.value = width;
}

/** The value range. */
const range = computed(() => props.maxLevel - props.minLevel);

const widthMax = computed(() => {
    return `${meterWidth.value}px`;
});

const widthHigh = computed(() => {
    return `${meterWidth.value * (1 - (1 / range.value) * (props.maxLevel - props.highLevel))}px`;
});

const widthLow = computed(() => {
    return `${meterWidth.value * (1 - (1 / range.value) * (props.maxLevel - props.lowLevel))}px`;
});

const widthMinimum = computed(() => {
    return `${0}px`;
});
</script>
<style lang="css" scoped>
meter {
    height: 1em;
    /* Required to get rid of the default background property
   * @devdoc "background" (without -color) is additionally required for Firefox
   */
    background-color: v-bind('backgroundColor');
    background: v-bind('backgroundColor');
    /* do not show a border (border none seems not to work)*/
    border: none;
    border-radius: 4px;
}

/* ------------------------------------------------------------------------- */

/** The styles for the meter bar (Firefox)
* @devdoc For Firefox (moz), see https://support.mozilla.org/en-US/questions/1308191 
* These must stand separately from webkit, because otherwise they would disturb each other 
*/
meter::-moz-meter-bar {
    background-image: linear-gradient(
        90deg,
        v-bind('lowRangeColor') v-bind('widthMinimum'),
        v-bind('lowRangeColor') v-bind('widthLow'),
        v-bind('midRangeColor') v-bind('widthLow'),
        v-bind('midRangeColor') v-bind('widthHigh'),
        v-bind('highRangeColor') v-bind('widthHigh'),
        v-bind('highRangeColor') v-bind('widthMax')
    );
}

/* ------------------------------------------------------------------------- */

/** The styles for the meter bar (Chrome and Webkit) 
* @devdoc For webkit, see https://css-tricks.com/html5-meter-element/ 
* @devdoc https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-meter-bar */
meter::-webkit-meter-bar {
    /* Required to get rid of the default background property */
    background: none;
    /* do not show a border (border none seems not to work)*/
    border: 0px;
    /* Show similar radius for the meter border as for the meter background */
    border-radius: 4px;
    /* Show similar height for the meter border as for the meter background */
    height: 1em;
}

meter::-webkit-meter-optimum-value,
meter::-webkit-meter-suboptimum-value,
meter::-webkit-meter-even-less-good-value {
    background-image: linear-gradient(
        90deg,
        v-bind('lowRangeColor') v-bind('widthMinimum'),
        v-bind('lowRangeColor') v-bind('widthLow'),
        v-bind('midRangeColor') v-bind('widthLow'),
        v-bind('midRangeColor') v-bind('widthHigh'),
        v-bind('highRangeColor') v-bind('widthHigh'),
        v-bind('highRangeColor') v-bind('widthMax')
    );
}
</style>
