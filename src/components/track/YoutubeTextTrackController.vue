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
                <!-- Video size toggler -->
                <div class="level-item has-text-left">
                    <div class="field is-horizontal">
                        <div class="field-body">
                            <div class="field">
                                <p class="control">
                                    <LabeledCheckbox
                                        v-model="vModelSmallVideo"
                                        label="Limit video height"
                                    ></LabeledCheckbox>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Caption toggler -->
                <!-- //TODO later implement the youtube captions -->
                <!-- <div class="level-item has-text-left">
                    <div class="field is-horizontal">
                        <div class="field-body">
                            <div class="field">
                                <p class="control">
                                    <LabeledCheckbox
                                        v-model="showCaptions"
                                        label="Show cue captions"
                                    ></LabeledCheckbox>
                                </p>
                            </div>
                        </div>
                    </div>
                </div> -->
                <!-- Caption size toggler -->
                <!-- <div class="level-item has-text-left">
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
                </div> -->
                <!-- Position toggler -->
                <!-- <div class="level-item has-text-left">
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
                </div> -->
            </template>
        </div>
        <div class="level-right"></div>
    </div>
</template>

<script setup lang="ts">
import { type PropType, computed } from 'vue';
import LabeledCheckbox from '@/components/editor/LabeledCheckbox.vue';
import type { ICue } from '@/store/compilation-types';

/** A YouTube Text controller, that transforms Replayer cues into
 * on-screen text cues on the video canvas
 * //TODO currently, this only toggles the video
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
    /** The title of the track */
    title: {
        type: String,
        default: '',
        required: false,
    },
    /** The track id
     * @remarks Used to have a unique id on the encapsulated video element
     */
    trackId: {
        type: String,
        required: true,
    },

    /** The cues to show
     * @remarks The cue descriptions are shown as VTT cues.
     */
    cues: Array as PropType<Array<ICue>>,
});

// --- VTT state ---

// const showCaptions = ref(true);
// const largeCaptions = ref(true);

// --- styling and position (NOTE: VTTRegion is not available on Chrome and other browsers)

//const centerPosition = ref(true);

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
const vModelSmallVideo = computed<boolean>({
    get(): boolean {
        return props.smallVideo;
    },
    set(value): void {
        emit('update:smallVideo', value);
    },
});
</script>

<style>
/* ::cue {
    background-color: #00000088;
}
::cue(.large) {
    background-color: #00000088;
    font-size: 3em;
} */
</style>
import type { ICue } from '@/store/ICue';
