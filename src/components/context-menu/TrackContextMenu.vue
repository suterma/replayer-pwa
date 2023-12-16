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
            :disabled="props.track.Cues.length < 1"
            title="Reassign cue shortcuts"
            subTitle="(first as seed, then incrementing)"
            @click="app.reassignCueShortcuts(props.track.Id)"
            :iconPath="mdiOrderNumericAscending"
        />
        <a
            :href="props.track.Url"
            download
            target="_blank"
            :disabled="
                !FileHandler.isDownloadableMediaFileName(props.track.Url)
            "
        >
            <DropdownMenuItem
                :disabled="
                    !FileHandler.isDownloadableMediaFileName(props.track.Url)
                "
                title="Download media file"
                subTitle="(to local file system)"
                @click="app.cloneTrack(props.track.Id)"
                :iconPath="mdiDownload"
            />
        </a>
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
    mdiDownload,
} from '@mdi/js';
import { addTextCues, confirm } from '@/code/ui/dialogs';
import { useAppStore } from '@/store/app';
import { computed, type PropType } from 'vue';
import type { ICue } from '@/store/ICue';
import type { ITrack } from '@/store/ITrack';
import FileHandler from '@/store/filehandler';

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
