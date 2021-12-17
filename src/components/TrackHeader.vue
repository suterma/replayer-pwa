<template>
    <!-- Level, also on mobile -->
    <nav class="level is-mobile is-clickable" @click="toggleExpanded()">
        <!-- Left side -->
        <div class="level-left">
            <div class="level-item">
                <p class="title is-4">{{ track.Name }}</p>
            </div>

            <div class="level-item">
                <!-- Playback indicator (using a small ghost button aligns the icon properly)-->
                <button class="button is-small is-ghost ml-3">
                    <span
                        :class="{
                            icon: true,
                            'has-text-success': this.isPlaying,
                            'has-text-grey-dark':
                                !this.isPlaying && this.isTrackLoaded,
                            'is-invisible': !this.isTrackLoaded,
                        }"
                    >
                        <i class="mdi mdi-24px">
                            <svg
                                style="width: 24px; height: 24px"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M19,12C19,15.86 15.86,19 12,19C8.14,19 5,15.86 5,12C5,8.14 8.14,5 12,5C15.86,5 19,8.14 19,12Z"
                                />
                            </svg>
                        </i>
                    </span>
                </button>
            </div>
        </div>
        <!-- Right side -->
        <div class="level-right">
            <!-- Artist info -->
            <div class="level-item">
                <span
                    class="is-pulled-right is-hidden-mobile is-size-7 has-text-right ml-3"
                >
                    <span v-if="track.Artist" class="has-opacity-half">
                        by
                    </span>
                    <span class="is-italic">
                        {{ track.Artist }}
                    </span>

                    <span v-if="track.Album" class="has-opacity-half">
                        on
                    </span>
                    <span class="is-italic">
                        {{ track.Album }}
                    </span>
                </span>
            </div>

            <div class="level-item">
                <CollapsibleButton :modelValue="this.modelValue" />
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track, ICue } from '@/store/compilation-types';
import CollapsibleButton from '@/components/CollapsibleButton.vue';

/** Displays a track tile with a title, and a panel with a dedicated media player and the cue buttons for it.
 * @remarks The panel is initially collapsed and no media is loaded into the player, as a performance optimization.
 * Details:
 * - The collapsed panel is not removed from the DOM because of issues with the $ref handling in conjunction with v-if
 * - However, the player's src property is only set when actually used to keep the memory footprint low.
 * @remarks Also handles the common replayer events for tracks
 */
export default defineComponent({
    name: 'TrackHeader',
    components: {
        CollapsibleButton,
    },
    props: {
        track: Track,

        modelValue: {
            type: Boolean,
            default: false,
        },
        /** Flag to indicate whether the player is currently playing
         */
        isPlaying: {
            type: Boolean,
            default: false,
        },

        /** Flag to indicate whether the player has it's track loaded.
         */
        isTrackLoaded: {
            type: Boolean,
            default: false,
        },

        /** Flag to indicate whether the current track is the active track
         */
        isActiveTrack: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            currentSeconds: 0,
        };
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
    watch: {},
    computed: {
        cues(): Array<ICue> | undefined {
            return this.track?.Cues;
        },

        /** Determines whether this is the active track (i.e. the globally selected cue is from this track ) */
        // isActiveTrack(): boolean {
        //     const selectedCueId = this.$store.getters.selectedCueId as string;
        //     if (!selectedCueId) {
        //         //if none selected, this track is not active anyway
        //         return false;
        //     }

        //     //Check for matching Ids
        //     return (
        //         (this.cues?.filter((c) => c.Id === selectedCueId).length ?? 0) >
        //         0
        //     );
        // },
    },
});
</script>
<style lang="css" scoped></style>
