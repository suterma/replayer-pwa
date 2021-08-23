<template>
    <span
        >{{ cue.Description }} {{ minutes }}:{{ twoDigitSeconds }} [{{
            cue.Shortcut
        }}]</span
    >
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Cue, ICue } from '@/store/compilation-types';

export default defineComponent({
    name: 'CueDisplay',
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
