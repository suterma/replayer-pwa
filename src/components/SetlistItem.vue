<template>
    <h2 class="title is-4">
        <TrackTitleName :track="track"></TrackTitleName>
        <slot></slot>
        <span v-if="track.Artist || track.Album" class="is-size-7 ml-2">
            <ArtistInfo :track="track" />
        </span>
    </h2>
    <h3 v-if="showMediaSource" class="subtitle">
        <span class="is-size-7">
            {{ track.Url }}
        </span>
        <span v-if="track.Duration !== null" class="is-size-7">
            (<TimeDisplay
                class="is-size-7"
                :modelValue="track.Duration"
            ></TimeDisplay
            >)
        </span>
    </h3>

    <table v-if="showCues" class="table is-narrow">
        <thead>
            <tr>
                <th class="is-size-7">Shortcut</th>
                <th class="is-size-7">Description</th>
                <th class="is-size-7">Time</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="cue in track.Cues" :key="cue.Id">
                <td>
                    <p class="tag has-border is-family-monospace">
                        {{ cue.Shortcut }}
                    </p>
                </td>
                <td  >
                    {{ cue.Description }}
                </td>
                <td  >
                    <TimeDisplay :modelValue="cue.Time"></TimeDisplay>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ArtistInfo from '@/components/ArtistInfo.vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import TrackTitleName from '@/components/TrackTitleName.vue';
import { Track } from '@/store/compilation-types';

/** A printable display of a complete compilation, with a track and cue listing */
export default defineComponent({
    name: 'SetlistItem',
    components: {
        ArtistInfo,
        TrackTitleName,
        TimeDisplay,
    },
    props: {
        /** The track to show an item for */
        track: {
            type: Track,
            required: true,
        },
        /** Whether to show the cues
         * @remarks Default is true
         */
        showCues: {
            type: Boolean,
            required: false,
            default: false,
        },
        /** Whether to show the media source */
        showMediaSource: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data() {
        return {};
    },
});
</script>
