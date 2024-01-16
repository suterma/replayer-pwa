<template>
    <div class="level is-mobile">
        <div class="level-left level-wrap">
            <!-- Video toggler -->
            <div class="level-item has-text-left">
                <div class="field is-horizontal">
                    <div class="field-body">
                        <div class="field">
                            <p class="control">
                                <LabeledCheckbox
                                    v-model="vModel"
                                    label="Show video"
                                ></LabeledCheckbox>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <template v-if="props.modelValue">
                <!-- Caption toggler -->
                <div class="level-item has-text-left">
                    <div class="field is-horizontal">
                        <div class="field-body">
                            <div class="field">
                                <p class="control">
                                    <LabeledCheckbox
                                        v-model="showCaptions"
                                        label="Captions"
                                    ></LabeledCheckbox>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Size toggler -->
                <div class="level-item has-text-left is-hidden-mobile">
                    <div class="field is-horizontal">
                        <div class="field-body">
                            <div class="field">
                                <p class="control">
                                    <LabeledCheckbox
                                        v-model="largeCaptions"
                                        label="Large cue captions"
                                    ></LabeledCheckbox>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Position toggler -->
                <div class="level-item has-text-left is-hidden-mobile">
                    <div class="field is-horizontal">
                        <div class="field-body">
                            <div class="field">
                                <p class="control">
                                    <LabeledCheckbox
                                        v-model="centerPosition"
                                        label="Center"
                                    ></LabeledCheckbox>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
        <div class="level-right"></div>
    </div>
</template>

<script setup lang="ts">
import { type PropType, type Ref, computed, ref, watchEffect } from 'vue';
import LabeledCheckbox from '@/components/editor/LabeledCheckbox.vue';
import type { ICue } from '@/store/ICue';

/** A VTT controller, that toggles video properties and transforms Replayer cues into
 * VTT cues on a VTT track on a video player element
 */

const props = defineProps({
    /** Whether to show the video. Includes showing these controls (except the showVideo toggler)
     */
    modelValue: {
        type: Boolean,
        required: false,
        default: true,
    },
    /** Whether to show the video in a small canvas.
     */
    smallVideo: {
        type: Boolean,
        required: false,
        default: true,
    },

    /** The cues to show
     * @remarks The cue descriptions are shown as VTT cues.
     */
    cues: Array as PropType<Array<ICue>>,

    /** Video element to use
     * @devdoc Note: the element is only available after the component has been mouted
     */

    videoElement: {
        type: null as unknown as PropType<HTMLVideoElement | null>,
        required: true,
        default: null,
    },
});

// --- VTT state ---

const showCaptions = ref(true);
const largeCaptions = ref(true);

// --- styling and position (NOTE: VTTRegion is not available on Chrome and other browsers)

const centerPosition = ref(true);

// --- VTT creation ---

/** The smallest amount of time that is resolved within the VTT's percision */
const TemporalEpsilon = 0.001;

const cueTextTrack: Ref<TextTrack | null> = ref(null);

// --- visibility ---

const emit = defineEmits(['update:modelValue', 'update:smallVideo']);

const vModel = computed<boolean>({
    get(): boolean {
        return props.modelValue;
    },
    set(value): void {
        emit('update:modelValue', value);
    },
});
const smallVideo = computed<boolean>({
    get(): boolean {
        return props.smallVideo;
    },
    set(value): void {
        emit('update:smallVideo', value);
    },
});

// --- captions ---

/** Handles changes in the caption visibility
 */
watchEffect(() => {
    if (cueTextTrack.value) {
        cueTextTrack.value.mode = showCaptions.value ? 'showing' : 'hidden';
    }
});

/** Handles changes in the caption definition
 */
watchEffect(() => {
    if (props.cues && props.videoElement) {
        if (cueTextTrack.value === null) {
            cueTextTrack.value = props.videoElement.addTextTrack(
                'captions' /* describes the content */,
                'Replayer cues',
                '',
            );
            cueTextTrack.value.mode = 'showing';
        }

        if (cueTextTrack.value) {
            // Delete existing cues
            const textTrackCues = cueTextTrack.value.cues;
            const cueCount = textTrackCues?.length;
            if (textTrackCues && cueCount) {
                for (let index = 0; index < cueCount; index++) {
                    const firstCueId = textTrackCues[0]?.id;
                    if (firstCueId) {
                        const deletableCue =
                            textTrackCues.getCueById(firstCueId);
                        if (deletableCue) {
                            cueTextTrack.value.removeCue(deletableCue);
                        }
                    }
                }
            }

            // Add the current cues
            props.cues?.forEach((cue) => {
                if (cue.Time !== null && cue.Duration !== null) {
                    const formattedText = largeCaptions.value
                        ? `<v.large>${cue.Description}</v>`
                        : `<v>${cue.Description}</v>`;

                    const vttCue = new VTTCue(
                        cue.Time - TemporalEpsilon,
                        cue.Time + cue.Duration - 2 * TemporalEpsilon,
                        formattedText,
                    );
                    vttCue.id = cue.Id;
                    vttCue.align = centerPosition.value ? 'center' : 'start';
                    cueTextTrack.value?.addCue(vttCue);
                }
            });
        }
    }
});
</script>

<style>
::cue {
    background-color: #00000088;
}
::cue(.large) {
    background-color: #00000088;
    font-size: 3em;
}
</style>
