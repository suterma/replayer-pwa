<template>
    <DropdownMenu
        v-memo="[props.track.Url]"
        title="Track context menu"
        :render-closed="false"
        left
        down
        data-cy="context-menu-track"
    >
        <div class="dropdown-item is-hidden-mobile">
            <p class="menu-label">Track</p>
        </div>
        <DropdownMenuButton
            title="Add multiple cues..."
            sub-title="(add cues using text lines)"
            :icon-path="mdiFileDelimitedOutline"
            @click="addMultipleCues()"
        />
        <DropdownMenuButton
            title="Inherit cues from..."
            sub-title="(use cues from another track)"
            :icon-path="mdiFileReplaceOutline"
            @click="inheritMultipleCues()"
        />
        <DropdownMenuButton
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
            <DropdownMenuButton
                :disabled="!isDownloadable"
                title="Download media file"
                sub-title="(to local file system)"
                :icon-path="mdiDownload"
                @click="app.cloneTrack(props.track.Id)"
            />
        </a>
        <DropdownMenuButton
            title="Clone"
            sub-title="(with cues and media)"
            :icon-path="mdiContentDuplicate"
            @click="app.cloneTrack(props.track.Id)"
        />
        <DropdownMenuButton
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
import DropdownMenuButton from '@/components/dropdown-menu/DropdownMenuButton.vue';
import {
    mdiContentDuplicate,
    mdiTrashCanOutline,
    mdiOrderNumericAscending,
    mdiFileDelimitedOutline,
    mdiDownload,
    mdiFileReplaceOutline,
} from '@mdi/js';
import { addTextCues, inheritCues, confirm } from '@/code/ui/dialogs';
import { useAppStore } from '@/store/app';
import { computed, type PropType } from 'vue';
import type { ICue } from '@/store/ICue';
import type { ITrack } from '@/store/ITrack';
import FileHandler from '@/store/filehandler';
import { storeToRefs } from 'pinia';
import { Cue } from '@/store/Cue';
import { v4 as uuidv4 } from 'uuid';
import { Meter } from '@/code/music/Meter';

const props = defineProps({
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

function inheritMultipleCues() {
    if (props.track) {
        inheritCues(props.track, mediaTracks.value).then(
            ({ source, replaceCues, inheritMeterBpm, inheritTrackPreroll }) => {
                if (source) {
                    const targetTrackId = props.track.Id;

                    // remove existing cues
                    if (replaceCues) {
                        app.deleteCues(targetTrackId);
                    }

                    // Inherit cues from source
                    source.Cues.forEach((cue) => {
                        // clone the cue, as this must not be the same object
                        const clonedCue = new Cue(
                            cue.Description,
                            cue.Remarks,
                            cue.Shortcut,
                            cue.Time,
                            cue.Duration,
                            cue.OmitPreRoll,
                            cue.OmitFadeIn,
                            uuidv4(),
                        );
                        app.addCue(targetTrackId, clonedCue);
                    });

                    // Apply track properties
                    if (inheritMeterBpm) {
                        if (source.Meter) {
                            app.updateMeter(targetTrackId, source.Meter);
                        } else {
                            const emptyMeter = new Meter(null, null, null);
                            app.updateMeter(targetTrackId, emptyMeter);
                        }
                    }

                    if (inheritTrackPreroll) {
                        app.updateTrackPreRoll(targetTrackId, source.PreRoll);
                    }

                    console.debug(
                        `TrackHeader::inheriting multiple cues from track done`,
                    );
                }
            },
        );
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

// --- for inheriting cues ---

const { mediaTracks } = storeToRefs(app);
</script>
<style scoped>
/** Do not use the "external link" icon here */
a[target='_blank']:after {
    display: none;
}
</style>
