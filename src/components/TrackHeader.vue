<template>
    <!-- Level, also on mobile 
    @remarks The id is used to scroll to this item when it's becoming the active track-->
    <nav
        class="level is-mobile is-clickable"
        v-bind:id="'track-' + track.Id"
        @click="toggleExpanded()"
    >
        <!-- Left side -->
        <div class="level-left">
            <!-- Title -->
            <div class="level-item">
                <p class="subtitle is-4">{{ track.Name }}</p>
            </div>
            <!-- Artist info (don't show on small devices)-->
            <div class="level-item is-hidden-mobile">
                <p class="is-size-7">
                    <span v-if="track.Artist" class="has-text-nowrap">
                        <span class="has-opacity-half">by&nbsp;</span>
                        <span class="is-italic">{{ track.Artist }}&nbsp;</span>
                    </span>
                    <span v-if="track.Album" class="has-text-nowrap">
                        <span class="has-opacity-half">on&nbsp;</span>
                        <span class="is-italic">{{ track.Album }}</span>
                    </span>
                </p>
            </div>
        </div>
        <!-- Right side -->
        <div class="level-right">
            <!-- Playback indicator (using a small ghost button aligns the icon properly)-->

            <div class="level-item">
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
            <!-- Expander -->
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
            console.debug(`TrackHeader::toggleExpanded:expanded:${expanded}`);
            this.$emit('update:modelValue', expanded);
        },
    },
    watch: {},
    computed: {
        cues(): Array<ICue> | undefined {
            return this.track?.Cues;
        },
    },
});
</script>
<style lang="scss" scoped>
/** Custom modification for the level in the context of a track.
* @remarks Allow the title text (on the left) to break between words, 
* and keep the context items (on the right) as close as reasonably possible */
.level {
    .level-left {
        word-break: break-word;
        /* This basis is set empirically to fit for two elements on the right */
        flex-basis: calc(100% - 80px);

        /* These items should grow, and shrink */
        .level-item {
            flex-shrink: 1;
            flex-grow: 1;
            text-align: left;
            /* Title, always justify left */
            justify-content: left;
        }
    }

    .level-right {
        min-width: 0;

        /* Keep the right hand items (play indicator, expander) as small as possible */
        flex-basis: 0;

        /* These items should keep their size */
        .level-item {
            flex-shrink: 0;
            flex-grow: 0;
            text-align: right;
        }
    }
}
</style>
