<template>
    <DropdownMenu v-once>
        <div class="dropdown-item is-hidden-mobile">
            <p class="menu-label">Track</p>
        </div>
        <DropdownMenuItem
            title="Add multiple cues..."
            subTitle="(add cues using text lines)"
            @click="addMultipleCues()"
            :iconPath="mdiFileDelimitedOutline"
        />
        <DropdownMenuItem
            title="Reassign cue shortcuts"
            subTitle="(first as seed, then incrementing)"
            @click="app.reassignCueShortcuts(props.track.Id)"
            :iconPath="mdiOrderNumericAscending"
        />
        <DropdownMenuItem
            v-experiment="experimentalAllowTrackSharingByLink"
            title="Share..."
            subTitle="(allows to share a track)"
            @click="startSharingTrack()"
            :iconPath="mdiShareVariant"
        />
        <DropdownMenuItem
            title="Clone"
            subTitle="(with cues and media)"
            @click="app.cloneTrack(props.track.Id)"
            :iconPath="mdiContentDuplicate"
        />
        <DropdownMenuItem
            title="Remove"
            subTitle="(remove the track from the compilation)"
            @click="remove()"
            :iconPath="mdiTrashCanOutline"
        />
    </DropdownMenu>
</template>

<script setup lang="ts">
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import DropdownMenuItem from '@/components/dropdown-menu/DropdownMenuItem.vue';
import {
    mdiContentDuplicate,
    mdiTrashCanOutline,
    mdiOrderNumericAscending,
    mdiFileDelimitedOutline,
    mdiShareVariant,
} from '@mdi/js';
import { addTextCues, confirm, shareTrack } from '@/code/ui/dialogs';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/store/app';
import { useSettingsStore } from '@/store/settings';
import { ref, type PropType, computed } from 'vue';

/** A menu for a track
 */
const props = defineProps({
    isFirstTrack: {
        type: Boolean,
        required: true,
    },
    isLastTrack: {
        type: Boolean,
        required: true,
    },
    track: {
        type: Object as PropType<ITrack>,
        required: true,
    },
});
const settings = useSettingsStore();
const { experimentalAllowTrackSharingByLink } = storeToRefs(settings);

const app = useAppStore();

function addMultipleCues() {
    if (props.track) {
        addTextCues(props.track).then((cues: ICue[]) => {
            if (cues) {
                const trackId = props.track.Id;
                cues.forEach((cue) => {
                    app.addCue(trackId, cue);
                });

                console.debug(
                    `TrackHeader::adding multiple cues from text done`,
                );
            }
        });
    }
}

/** Removes the track from the compilation
 */
function remove() {
    confirm(
        'Removing track',
        `Do you want to remove track "${props.track.Name}"?`,
    ).then((ok) => {
        if (ok) {
            app.removeTrack(props.track.Id);
        }
    });
}

// --- System-supported sharing ---

const trackApiUrl = computed(() => {
    return TrackApi.Url(props.track);
});

import { isClient } from '@vueuse/shared';
import { useShare } from '@vueuse/core';
import { TrackApi } from '@/code/api/TrackApi';
import type { ITrack } from '@/store/ITrack';
import type { ICue } from '@/store/ICue';

const options = ref({
    title: 'Replayer link to: ' + TrackApi.Descriptor(props.track),
    text: TrackApi.Descriptor(props.track),
    url: isClient ? trackApiUrl.value : '',
});

const { share, isSupported } = useShare(options);

/** Initiates sharing of a track
 * @remarks If supported, uses the Web Share API, otherwise an interal fallback
 * dialog is presented to the user
 */
function startSharingTrack() {
    if (isSupported.value) {
        share();
    } else {
        shareTrack(props.track);
    }
}
</script>
