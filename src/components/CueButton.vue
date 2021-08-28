<template>
    <button
        class="button is-primary has-background-primary-light has-text-dark"
    >
        <span class="icon"> ▶ </span>
        <span class="has-text-weight-semibold">{{ cue?.Description }}</span>
        <!-- On small devices, hide the informational time stamp to save screen real estate -->
        <span class="is-hidden-mobile">
            &nbsp;
            <span class="has-opacity-half">
                {{ minutes }}:{{ twoDigitSeconds }}
            </span>
        </span>
        <!-- On touch devices, the key shortcuts are probably not used, thus hide them to save screen real estate -->
        <span class="is-hidden-touch">
            &nbsp;&nbsp;
            <span class="tag is-primary is-light">{{ cue?.Shortcut }}</span>
        </span>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Cue, ICue } from '@/store/compilation-types';

export default defineComponent({
    name: 'CueButton',
    components: {},
    props: {
        cue: Cue,
    },
    methods: {},
    computed: {
        /** Gets the whole minutes of the timestamp  */
        minutes(): number | null {
            if (this.cue && this.cue?.Time != null) {
                var minutes = Math.floor(this.cue.Time / 60);
                return minutes;
            }
            return null;
        },

        /** Gets the rounded seconds (without whole minutes) of the timestamp  */
        seconds(): number | null {
            if (this.minutes != null && this.cue && this.cue?.Time != null) {
                var seconds = Math.round(this.cue?.Time - this.minutes * 60);
                return seconds;
            }
            return null;
        },

        /** Gets a string representation of the seconds part, with 2 digits fixed
         * @devdoc Makes sure, that nothing is shown for actual null values
         */
        twoDigitSeconds(): string {
            if (this.seconds != null) {
                return this.seconds.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                });
            } else return '';
        },
    },
});
</script>

<style scoped>
.has-background-primary-light {
    /** A specific light color for better use of a black text color */
    background-color: hsl(171, 100%, 80%) !important;
}

.has-opacity-half {
    opacity: 50%;
}
</style>
