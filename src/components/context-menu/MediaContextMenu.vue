<template>
    <DropdownMenu
        :icon-path="mdiCog"
        :render-closed="false"
        title="Media context menu"
        left
        down
    >
        <DropdownMenuButton
            title="Speed"
            sub-title="Change playback speed"
            :icon-path="mdiCog"
        >
            <input
                type="range"
                min="0.25"
                max="4"
                step=".05"
                :value="handler.playbackRateController.playbackRate"
                @update="updatePlaybackRate($event.target.value)"
            />
        </DropdownMenuButton>
    </DropdownMenu>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import DropdownMenuButton from '@/components/dropdown-menu/DropdownMenuButton.vue';
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import { mdiCog } from '@mdi/js';

import type { IMediaHandler } from '@/code/media/IMediaHandler';
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
