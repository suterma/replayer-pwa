<template>
    <DropdownMenu
        :icon-path="mdiCog"
        :render-closed="false"
        title="Media context menu"
        data-cy="context-menu-media"
    >
        <DropdownMenuItem
            v-if="experimentalPitchShift"
            v-experiment="experimentalPitchShift"
        >
            <MenuItemContent title="Shift">
                <template #right-item>
                    <div class="button is-nav is-indicator">
                        <span class="is-family-monospace">{{
                            currentPitchShiftDisplay
                        }}
                            cent</span>
                    </div>

                    <button
                        :disabled="props.handler.pitchShiftController.pitchShift ==
                            DefaultPitchShift
                            "
                        class="button"
                        @click="updatePitchShift(DefaultPitchShift)"
                    >
                        Reset
                    </button>
                    <ParameterKnob
                        title="Drag or scroll to change pitch"
                        class="button is-nav is-rounded"
                        :model-value="props.handler.pitchShiftController.pitchShift
                            "
                        value-class="has-text-light"
                        rim-class="has-text-grey-light"
                        data-cy="pitch"
                        :max-value="12"
                        :min-value="-12"
                        @update="updatePitchShift"
                    />
                </template>
            </MenuItemContent>
        </DropdownMenuItem>
        <DropdownMenuItem>
            <MenuItemContent title="Speed">
                <template #right-item>
                    <div class="button is-nav is-indicator">
                        <span class="is-family-monospace">{{
                            currentPlaybackRateDisplay
                            }}x</span>
                    </div>

                    <div
                        v-if="beatsPerMinute"
                        class="button is-nav is-indicator is-hidden-mobile"
                    >
                        <span>BPM:&nbsp;</span>
                        <span>~{{
                            Math.round(
                                beatsPerMinute *
                                props.handler.playbackRateController
                                    .playbackRate,
                            )
                        }}</span>
                    </div>
                    <button
                        :disabled="props.handler.playbackRateController.playbackRate ==
                            DefaultPlaybackRate
                            "
                        class="button"
                        @click="updatePlaybackRate(DefaultPlaybackRate)"
                    >
                        Reset
                    </button>
                    <SpeedKnob
                        :speed="props.handler.playbackRateController.playbackRate
                            "
                        @update:speed="updatePlaybackRate"
                    />
                </template>
            </MenuItemContent>
        </DropdownMenuItem>
    </DropdownMenu>
</template>

<script
    setup
    lang="ts"
>
import { ref, type PropType } from 'vue';
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import MenuItemContent from '@/components/dropdown-menu/MenuItemContent.vue';
import { mdiCog } from '@mdi/js';
import type { IMediaHandler } from '@/code/media/IMediaHandler';
import { DefaultPitchShift, DefaultPlaybackRate } from '@/store/Track';
import SpeedKnob from '../controls/SpeedKnob.vue';
import DropdownMenuItem from '@/components/dropdown-menu/DropdownMenuItem.vue';
import ParameterKnob from '../controls/ParameterKnob.vue';
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';

/** A nav bar as header with a menu for a media item of a track
 */

const props = defineProps({
    handler: {
        type: Object as PropType<IMediaHandler>,
        required: true,
    },
    beatsPerMinute: {
        type: Number as () => number | null | undefined,
        required: false,
        default: null
    }
});

const settings = useSettingsStore();
const { experimentalPitchShift } = storeToRefs(settings);


const currentPlaybackRateDisplay = ref(props.handler.playbackRateController.playbackRate.toFixed(2));
const currentBpmDisplay = ref(props.beatsPerMinute ? Math.round(
    props.beatsPerMinute *
    props.handler.playbackRateController
        .playbackRate,
) : '');

/** Updates the playback rate */
function updatePlaybackRate(rate: number) {
    // eslint-disable-next-line vue/no-mutating-props
    props.handler.playbackRateController.playbackRate = rate;

    currentPlaybackRateDisplay.value = rate.toFixed(
        2,
    )
    currentBpmDisplay.value = props.beatsPerMinute ? Math.round(
        props.beatsPerMinute *
        props.handler.playbackRateController
            .playbackRate,
    ) : ''
}


const currentPitchShiftDisplay = ref(props.handler.pitchShiftController.pitchShift.toFixed(2));

/** Updates the pitch shift */
function updatePitchShift(shift: number) {
    // eslint-disable-next-line vue/no-mutating-props
    props.handler.pitchShiftController.pitchShift = shift;

    currentPitchShiftDisplay.value = shift.toFixed(2);
}

</script>
