<template>
    <nav class="level is-mobile">
        <!-- Left side -->
        <div class="level-left">
            <div
                class="level-item has-cropped-text"
                style="max-width: calc(100vw - 60px)"
            >
                <h2 class="title is-4" :title="track.Url">
                    <slot v-if="$slots.default"></slot>
                    <TrackTitleName :name="track.Name"></TrackTitleName>
                </h2>
            </div>
        </div>

        <!-- Right side -->
        <div class="level-right">
            <div class="level-item is-hidden-mobile">
                <span v-if="track.Artist || track.Album" class="is-size-7 ml-2">
                    <!-- Artist info (should not take too much width, and hide on small displays anyways)-->
                    <ArtistInfo
                        :artist="track.Artist"
                        :album="track.Album"
                        style="max-width: 50vw"
                    />
                </span>
            </div>

            <div class="level-item">
                <slot name="title-end"> </slot>
            </div>
        </div>
    </nav>

    <h3 v-if="showMediaSource" class="subtitle">
        <span class="is-size-7">
            {{ track.Url }}
        </span>
        <span v-if="track.Duration !== null" class="is-size-7">
            (<TimeDisplay
                class="is-size-7"
                :model-value="track.Duration"
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
                <th
                    v-if="props.track.UseMeasureNumbers"
                    v-experiment="experimentalUseMeter"
                    class="is-size-7"
                >
                    Measure
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="cue in track.Cues" :key="cue.Id">
                <td>
                    <p class="tag has-border is-family-monospace">
                        {{ cue.Shortcut }}
                    </p>
                </td>
                <td>
                    {{ cue.Description }}
                </td>
                <td>
                    <TimeDisplay :model-value="cue.Time"></TimeDisplay>
                </td>
                <td
                    v-if="props.track.UseMeasureNumbers"
                    v-experiment="experimentalUseMeter"
                >
                    <MeasureDisplay :model-value="cue.Time"></MeasureDisplay>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
/** A printable display of a track, with cue listing */

import { type PropType, computed, provide, readonly } from 'vue';
import { storeToRefs } from 'pinia';
import ArtistInfo from '@/components/ArtistInfo.vue';
import MeasureDisplay from '@/components/MeasureDisplay.vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import TrackTitleName from '@/components/track/TrackTitleName.vue';
import { useSettingsStore } from '@/store/settings';
import { meterInjectionKey } from './track/TrackInjectionKeys';
import type { ITrack } from '@/store/ITrack';

const props = defineProps({
    /** The track to show an item for */
    track: {
        type: Object as PropType<ITrack>,
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
});

/** The track's meter
 * @devdoc This value is provided to descendant components using the provide/inject pattern.
 * @devdoc Here, a ComputedRef must be used, not a ref, because the ref of the dereferenced meter
 * would not be reactive.
 */
const meter = computed(() => props.track.Meter);
provide(meterInjectionKey, readonly(meter));

const settings = useSettingsStore();
const { experimentalUseMeter } = storeToRefs(settings);
</script>
import { Track } from '@/store/Track';
