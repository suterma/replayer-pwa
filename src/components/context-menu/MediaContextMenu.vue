<template>
    <DropdownMenu
        :icon-path="mdiCog"
        :render-closed="false"
        title="Media context menu"
        up
        left
    >
        <div class="dropdown-item" data-cy="dropdown-menu-item">
            <MenuItemContent title="Speed">
                <template #right-item>
                    <div class="button is-nav is-indicator">
                        <span
                            >{{
                                props.handler.playbackRateController
                                    .playbackRate
                            }}x</span
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
                        :model-value="
                            props.handler.playbackRateController.playbackRate
                        "
                        @update:model-value="updatePlaybackRate"
                /></template>
            </MenuItemContent>
        </div>
    </DropdownMenu>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import DropdownMenuItem from '@/components/dropdown-menu/DropdownMenuItem.vue';
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import MenuItemContent from '@/components/dropdown-menu/MenuItemContent.vue';
import SpeedKnob from '@/components/controls/SpeedKnob.vue';

import { mdiCog } from '@mdi/js';

import type { IMediaHandler } from '@/code/media/IMediaHandler';
import { DefaultPlaybackRate } from '@/store/Track';
/** A nav bar as header with a menu for a compilation
 */

const props = defineProps({
    handler: {
        type: Object as PropType<IMediaHandler>,
        required: true,
    },
});

/** Updates the track name */
function updatePlaybackRate(rate: number) {
    // eslint-disable-next-line vue/no-mutating-props
    props.handler.playbackRateController.playbackRate = rate;
}
</script>
