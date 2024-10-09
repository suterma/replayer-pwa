<template>
    <nav class="level is-mobile">
        <!-- Left side -->
        <div class="level-left">
            <div class="level-item">
                <span class="title is-4"><slot></slot></span>

                <!-- Just show the type icon here -->
                <MediaSourceIndicator
                    v-once
                    :source="track.Url"
                    :show-source-text="false"
                    :show-source-icon="false"
                    :show-size="true"
                    :show-type="true"
                >
                </MediaSourceIndicator>
            </div>
            <div
                class="level-item has-cropped-text"
                style="max-width: calc(100vw - 160px)"
            >
                <TrackTitle
                    class="is-flex-shrink-1 ml-3"
                    :track="track"
                    :tags="showTags"
                ></TrackTitle>
            </div>
        </div>

        <!-- Right side -->
        <div class="level-right">
            <div class="level-item">
                <slot name="title-end"> </slot>
            </div>
        </div>
    </nav>

    <h3 v-if="showMediaSource" class="subtitle">
        <span class="is-size-7 is-family-monospace">
            <MediaSourceIndicator
                class="pl-6 ml-1"
                :source="track.Url"
                :show-source-text="true"
                :show-source-icon="false"
                :show-type-icon="false"
            >
                <span v-if="track.Duration !== null">
                    &nbsp; (<TimeDisplay
                        class="is-size-7"
                        :model-value="track.Duration"
                    ></TimeDisplay
                    >)
                </span>
            </MediaSourceIndicator>
        </span>
    </h3>

    <table v-if="showCues && track.Cues.length > 0" class="table is-narrow">
        <thead>
            <tr>
                <th class="is-size-7">Shortcut</th>
                <th class="is-size-7">Description</th>
                <th class="is-size-7">Remarks</th>
                <th class="is-size-7">Time</th>
                <th
                    v-if="props.track.UseMeasureNumbers"
                    v-experiment="experimentalUseMeter"
                    class="is-size-7"
                >
                    Measure
                </th>
                <th
                    v-if="props.track.UseMeasureNumbers"
                    v-experiment="experimentalUseMeter"
                    class="is-size-7"
                >
                    Duration [Measures]
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
                <td class="is-italic">
                    {{ cue.Remarks }}
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
                <div
                    v-if="props.track.UseMeasureNumbers"
                    v-experiment="experimentalUseMeter"
                    class="level-item is-flex-shrink-1"
                >
                    <button class="button is-indicator">
                        <MeasureDifferenceDisplay
                            :model-value="cue.Duration"
                        ></MeasureDifferenceDisplay>
                    </button>
                </div>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
/** A printable display of a track, with cue listing */

import { type PropType, computed, provide, readonly } from 'vue';
import { storeToRefs } from 'pinia';
import MeasureDisplay from '@/components/MeasureDisplay.vue';
import MeasureDifferenceDisplay from '@/components/MeasureDifferenceDisplay.vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import { useSettingsStore } from '@/store/settings';
import { meterInjectionKey } from './track/TrackInjectionKeys';
import type { ITrack } from '@/store/ITrack';
import MediaSourceIndicator from '@/components/indicators/MediaSourceIndicator.vue';
import TrackTitle from '@/components/track/TrackTitle.vue';

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
    /** Whether to show the item tags */
    showTags: {
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
