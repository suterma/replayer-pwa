<template>
    <DropdownMenu
        v-memo="[props.track.Url]"
        title="Track context menu"
        left
        down
    >
        <div class="dropdown-item is-hidden-mobile">
            <p class="menu-label">Track</p>
        </div>
        <DropdownMenuItem
            title="Add multiple cues..."
            sub-title="(add cues using text lines)"
            :icon-path="mdiFileDelimitedOutline"
            @click="addMultipleCues()"
        />
        <DropdownMenuItem
            :disabled="props.track.Cues.length < 1"
            title="Reassign cue shortcuts"
            sub-title="(first as seed, then incrementing)"
            :icon-path="mdiOrderNumericAscending"
            @click="app.reassignCueShortcuts(props.track.Id)"
        />
        <a
            :href="props.track.Url"
            download
            target="_blank"
            :disabled="!isDownloadable"
        >
            <DropdownMenuItem
                :disabled="!isDownloadable"
                title="Download media file"
                sub-title="(to local file system)"
                :icon-path="mdiDownload"
                @click="app.cloneTrack(props.track.Id)"
            />
        </a>
        <DropdownMenuItem
            title="Clone"
            sub-title="(with cues and media)"
            :icon-path="mdiContentDuplicate"
            @click="app.cloneTrack(props.track.Id)"
        />
        <DropdownMenuItem
            title="Remove"
            sub-title="(remove the track from the compilation)"
            :icon-path="mdiTrashCanOutline"
            @click="remove()"
        />
    </DropdownMenu>
</template>

<script setup lang="ts">
/** A menu for a track
 * @devdoc The download menu item is only updated when the URL (the used media) changes
 */
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import DropdownMenuItem from '@/components/dropdown-menu/DropdownMenuItem.vue';
import {
    mdiContentDuplicate,
    mdiTrashCanOutline,
    mdiOrderNumericAscending,
    mdiFileDelimitedOutline,
    mdiDownload,
} from '@mdi/js';
import { addTextCues, confirm } from '@/code/ui/dialogs';
import { useAppStore } from '@/store/app';
import { computed, type PropType } from 'vue';
import type { ICue } from '@/store/ICue';
import type { ITrack } from '@/store/ITrack';
import FileHandler from '@/store/filehandler';

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

const isDownloadable = computed(() =>
    FileHandler.isDownloadableMediaFileName(props.track.Url),
);
</script>
<style scoped>
/** Do not use the "external link" icon here */
a[target='_blank']:after {
    display: none;
}
</style>
