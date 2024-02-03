<template>
    <DropdownMenu
        right
        class="is-slim"
        :icon-path="currentModeIcon"
        :render-closed="true"
        :title="currentModeTitle"
    >
        <!-- <DropdownMenuItem
            v-for="mode in Object.values(PlaybackMode)"
            :key="mode"
            :title="modeText(mode)"
            :icon-path="modeIcon(mode)"
            :disabled="mode == props.modelValue"
             :isActive="PlaybackMode.PlayTrack == props.modelValue"
           @click="emit('update:modelValue', mode)"
        /> -->

        <DropdownMenuItem
            :key="PlaybackMode.PlayTrack"
            :title="modeText(PlaybackMode.PlayTrack)"
            :icon-path="modeIcon(PlaybackMode.PlayTrack)"
            :disabled="PlaybackMode.PlayTrack == props.modelValue"
            :isActive="PlaybackMode.PlayTrack == props.modelValue"
            @click="emit('update:modelValue', PlaybackMode.PlayTrack)"
        />
        <DropdownMenuItem
            :key="PlaybackMode.LoopTrack"
            :title="modeText(PlaybackMode.LoopTrack)"
            :icon-path="modeIcon(PlaybackMode.LoopTrack)"
            :disabled="PlaybackMode.LoopTrack == props.modelValue"
            :isActive="PlaybackMode.LoopTrack == props.modelValue"
            @click="emit('update:modelValue', PlaybackMode.LoopTrack)"
        />
        <DropdownMenuItem
            :key="PlaybackMode.PlayCue"
            :title="modeText(PlaybackMode.PlayCue)"
            :icon-path="modeIcon(PlaybackMode.PlayCue)"
            :disabled="PlaybackMode.PlayCue == props.modelValue"
            :isActive="PlaybackMode.PlayCue == props.modelValue"
            @click="emit('update:modelValue', PlaybackMode.PlayCue)"
        />
        <DropdownMenuItem
            :key="PlaybackMode.LoopCue"
            :title="modeText(PlaybackMode.LoopCue)"
            :icon-path="modeIcon(PlaybackMode.LoopCue)"
            :disabled="PlaybackMode.LoopCue == props.modelValue"
            :isActive="PlaybackMode.LoopCue == props.modelValue"
            @click="emit('update:modelValue', PlaybackMode.LoopCue)"
        />
        <DropdownMenuItem
            v-if="experimentalUseQueueCueMode"
            class="is-experimental"
            :key="PlaybackMode.QueueCue"
            :title="modeText(PlaybackMode.QueueCue)"
            :icon-path="modeIcon(PlaybackMode.QueueCue)"
            :disabled="PlaybackMode.QueueCue == props.modelValue"
            :isActive="PlaybackMode.QueueCue == props.modelValue"
            @click="emit('update:modelValue', PlaybackMode.QueueCue)"
        />
        <DropdownMenuItem
            v-if="hasSecondTrack"
            :key="PlaybackMode.LoopCompilation"
            :title="modeText(PlaybackMode.LoopCompilation)"
            :icon-path="modeIcon(PlaybackMode.LoopCompilation)"
            :disabled="PlaybackMode.LoopCompilation == props.modelValue"
            :isActive="PlaybackMode.LoopCompilation == props.modelValue"
            @click="emit('update:modelValue', PlaybackMode.LoopCompilation)"
        />
        <DropdownMenuItem
            v-if="hasSecondTrack"
            :key="PlaybackMode.ShuffleCompilation"
            :title="modeText(PlaybackMode.ShuffleCompilation)"
            :icon-path="modeIcon(PlaybackMode.ShuffleCompilation)"
            :disabled="PlaybackMode.ShuffleCompilation == props.modelValue"
            :isActive="PlaybackMode.ShuffleCompilation == props.modelValue"
            @click="emit('update:modelValue', PlaybackMode.ShuffleCompilation)"
        />
    </DropdownMenu>
</template>

<script setup lang="ts">
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import DropdownMenuItem from '@/components/dropdown-menu/DropdownMenuItem.vue';
import { PlaybackMode } from '@/store/PlaybackMode';
import {
    rTrackPlay,
    rTrackRepeat,
    rRepeatVariant,
    rShuffleVariant,
    rTrackPlayOnce,
    rTrackRepeatOnce,
} from '@/components/icons/ReplayerIcon';
import { mdiPlaylistPlay } from '@mdi/js';
import { computed } from 'vue';
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';

/** A nav bar as header with a menu for a compilation
 */

const props = defineProps({
    modelValue: {
        type: String as () => PlaybackMode,
        required: true,
    },

    /** Whether the compilation has a second track at all
     * @remarks If there is just one track, compilation-related playback modes are not offered
     */
    hasSecondTrack: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue']);

const settings = useSettingsStore();
const { experimentalUseQueueCueMode } = storeToRefs(settings);

const currentModeTitle = computed(() => {
    return 'Current mode: ' + modeText(props.modelValue);
});

function modeText(mode: PlaybackMode) {
    switch (mode) {
        case PlaybackMode.PlayTrack:
            return 'Play track';
        case PlaybackMode.LoopTrack:
            return 'Loop track';
        case PlaybackMode.PlayCue:
            return 'Play cue';
        case PlaybackMode.LoopCue:
            return 'Loop cue';
        case PlaybackMode.QueueCue:
            return 'Queue cue (EXPERIMENTAL)';
        case PlaybackMode.LoopCompilation:
            return 'Loop all';
        case PlaybackMode.ShuffleCompilation:
            return 'Shuffle all';
        default:
            return '';
    }
}

const currentModeIcon = computed(() => {
    return modeIcon(props.modelValue);
});

function modeIcon(mode: PlaybackMode) {
    switch (mode) {
        case PlaybackMode.PlayTrack:
            return rTrackPlay;
        case PlaybackMode.LoopTrack:
            return rTrackRepeat;
        case PlaybackMode.PlayCue:
            return rTrackPlayOnce;
        case PlaybackMode.LoopCue:
            return rTrackRepeatOnce;
        case PlaybackMode.QueueCue:
            return mdiPlaylistPlay;
        case PlaybackMode.LoopCompilation:
            return rRepeatVariant;
        case PlaybackMode.ShuffleCompilation:
            return rShuffleVariant;
        default:
            return '';
    }
}
</script>
