<template>
    <DropdownMenu
        v-tooltip.top.hover="currentModeTitle"
        left
        class="is-slim"
        :icon-path="currentModeIcon"
        :render-closed="false"
        data-cy="context-menu-playbackmode"
    >
        <DropdownMenuButton
            :key="PlaybackMode.PlayTrack"
            :title="modeText(PlaybackMode.PlayTrack)"
            :icon-path="modeIcon(PlaybackMode.PlayTrack)"
            :disabled="PlaybackMode.PlayTrack == props.modelValue"
            :is-active="PlaybackMode.PlayTrack == props.modelValue"
            data-cy="select-play-track"
            @click="emit('update:modelValue', PlaybackMode.PlayTrack)"
        />
        <DropdownMenuButton
            :key="PlaybackMode.LoopTrack"
            :title="modeText(PlaybackMode.LoopTrack)"
            :icon-path="modeIcon(PlaybackMode.LoopTrack)"
            :disabled="PlaybackMode.LoopTrack == props.modelValue"
            :is-active="PlaybackMode.LoopTrack == props.modelValue"
            data-cy="select-loop-track"
            @click="emit('update:modelValue', PlaybackMode.LoopTrack)"
        />
        <DropdownMenuButton
            :key="PlaybackMode.PlayCue"
            :title="modeText(PlaybackMode.PlayCue)"
            :icon-path="modeIcon(PlaybackMode.PlayCue)"
            :disabled="PlaybackMode.PlayCue == props.modelValue"
            :is-active="PlaybackMode.PlayCue == props.modelValue"
            data-cy="select-play-cue"
            @click="emit('update:modelValue', PlaybackMode.PlayCue)"
        />
        <DropdownMenuButton
            :key="PlaybackMode.LoopCue"
            :title="modeText(PlaybackMode.LoopCue)"
            :icon-path="modeIcon(PlaybackMode.LoopCue)"
            :disabled="PlaybackMode.LoopCue == props.modelValue"
            :is-active="PlaybackMode.LoopCue == props.modelValue"
            data-cy="select-loop-cue"
            @click="emit('update:modelValue', PlaybackMode.LoopCue)"
        />
        <DropdownMenuButton
            v-if="experimentalUseQueueCueMode"
            :key="PlaybackMode.QueueCue"
            class="is-experimental"
            :title="modeText(PlaybackMode.QueueCue)"
            :icon-path="modeIcon(PlaybackMode.QueueCue)"
            :disabled="PlaybackMode.QueueCue == props.modelValue"
            :is-active="PlaybackMode.QueueCue == props.modelValue"
            data-cy="select-queue-cue"
            @click="emit('update:modelValue', PlaybackMode.QueueCue)"
        />
        <DropdownMenuButton
            v-if="hasSecondTrack"
            :key="PlaybackMode.LoopCompilation"
            :title="modeText(PlaybackMode.LoopCompilation)"
            :icon-path="modeIcon(PlaybackMode.LoopCompilation)"
            :disabled="PlaybackMode.LoopCompilation == props.modelValue"
            :is-active="PlaybackMode.LoopCompilation == props.modelValue"
            data-cy="select-loop-compilation"
            @click="emit('update:modelValue', PlaybackMode.LoopCompilation)"
        />
        <DropdownMenuButton
            v-if="hasSecondTrack"
            :key="PlaybackMode.ShuffleCompilation"
            :title="modeText(PlaybackMode.ShuffleCompilation)"
            :icon-path="modeIcon(PlaybackMode.ShuffleCompilation)"
            :disabled="PlaybackMode.ShuffleCompilation == props.modelValue"
            :is-active="PlaybackMode.ShuffleCompilation == props.modelValue"
            data-cy="select-shuffle-compilation"
            @click="emit('update:modelValue', PlaybackMode.ShuffleCompilation)"
        />
    </DropdownMenu>
</template>

<script setup lang="ts">
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import DropdownMenuButton from '@/components/dropdown-menu/DropdownMenuButton.vue';
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
