<template>
    <DropdownMenu
        :icon-path="mdiCog"
        :render-closed="false"
        title="Media context menu"
    >
        <div class="dropdown-item" data-cy="dropdown-menu-item">
            <MenuItemContent title="Speed">
                <template #right-item>
                    <div class="button is-nav is-indicator">
                        <span class="is-family-monospace"
                            >{{
                                props.handler.playbackRateController.playbackRate.toFixed(
                                    2,
                                )
                            }}x</span
                        >
                    </div>

                    <div
                        v-if="track.Meter?.BeatsPerMinute"
                        class="button is-nav is-indicator"
                    >
                        <span>BPM:&nbsp;</span>
                        <span
                            >~{{
                                Math.round(
                                    track.Meter.BeatsPerMinute *
                                        props.handler.playbackRateController
                                            .playbackRate,
                                )
                            }}</span
                        >
                    </div>
                    <button
                        :disabled="
                            props.handler.playbackRateController.playbackRate ==
                            DefaultPlaybackRate
                        "
                        class="button"
                        @click="updatePlaybackRate(DefaultPlaybackRate)"
                    >
                        Reset
                    </button>
                    <SpeedKnob
                        :speed="
                            props.handler.playbackRateController.playbackRate
                        "
                        @update:speed="updatePlaybackRate"
                /></template>
            </MenuItemContent>
        </div>
    </DropdownMenu>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import MenuItemContent from '@/components/dropdown-menu/MenuItemContent.vue';
import { mdiCog } from '@mdi/js';
import type { IMediaHandler } from '@/code/media/IMediaHandler';
import { DefaultPlaybackRate } from '@/store/Track';
import SpeedKnob from '../controls/SpeedKnob.vue';
import type { ITrack } from '@/store/ITrack';
/** A nav bar as header with a menu for a compilation
 */

const props = defineProps({
    handler: {
        type: Object as PropType<IMediaHandler>,
        required: true,
    },
    track: {
        type: Object as PropType<ITrack>,
        required: true,
    },
});

/** Updates the track name */
function updatePlaybackRate(rate: number) {
    // eslint-disable-next-line vue/no-mutating-props
    props.handler.playbackRateController.playbackRate = rate;
}
</script>
