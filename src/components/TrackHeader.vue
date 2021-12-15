<template>
    <!-- Track header, including artist info, expansion-toggler and adaptive spacing -->
    <h2
        :class="{
            'mb-0': !expanded,
        }"
        class="subtitle is-clickable"
        v-bind:id="'track-' + track.Id"
        @click="toggleExpanded()"
    >
        <span
            :class="{
                'has-text-success': isActiveTrack,
            }"
            >{{ track.Name }}</span
        >

        <!-- Playback indicator -->
        <span class="ml-3">
            <span
                :class="{
                    icon: true,
                    'has-text-success': this.isPlaying,
                    'is-invisible	': !this.isPlaying,
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

        <!-- Text colors similar to cues -->
        <!-- Note: The click handler is registered on the complete title -->

        <CollapsibleButton
            class="is-pulled-right is-size-7 has-text-right ml-3"
            :modelValue="expanded"
            @update:modelValue="updateExpanded()"
        />
        <!-- Artist info -->
        <span
            class="is-pulled-right is-hidden-mobile is-size-7 has-text-right ml-3"
        >
            <span v-if="track.Artist" class="has-opacity-half"> by </span>
            <span class="is-italic">
                {{ track.Artist }}
            </span>

            <span v-if="track.Album" class="has-opacity-half"> on </span>
            <span class="is-italic">
                {{ track.Album }}
            </span>
        </span>
    </h2>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track } from '@/store/compilation-types';

import CollapsibleButton from '@/components/CollapsibleButton.vue';

/** An expandable track title.
 * @remarks Shows an expansion icon.
 */
export default defineComponent({
    name: 'TrackHeader',
    components: {
        CollapsibleButton,
    },
    props: {
        track: Track,
        /** Whether this track tile is shown as expanded, with the player and the cue buttons displayed.
         */
        expanded: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:expanded'],
    data() {
        return {};
    },
    methods: {
        toggleExpanded() {
            const expanded = !this.expanded;
            this.$emit('update:expanded', expanded);
        },
        updateExpanded(value: boolean) {
            const expanded = value;
            this.$emit('update:expanded', expanded);
        },
    },
    watch: {},
    computed: {},
});
</script>
<style lang="css" scoped></style>
