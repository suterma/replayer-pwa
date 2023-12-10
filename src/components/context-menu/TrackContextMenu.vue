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
import { type ICue, type ITrack } from '@/store/compilation-types';
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

const router = useRouter();

/** Gets the timestamp of a cue as an object key
 * @devdoc Makes sure the numeric keys are not integers, to keep a more suitable order
 * later on when creating the API query parameters
 * Javascript unfortunately orders integer object keys as first
 */
function getCueObjectKey(value: ICue): string {
    if (!value.Time) {
        return '0.0';
    }
    return value.Time.toString();
}

const trackUrl = computed(() => {
    //Prepare track metadata
    let apiQuery = {
        media: props.track?.Url,
        title: props.track?.Name,
        album: props.track?.Album,
        artist: props.track?.Artist,
    };

    //Add available cues
    const cues = props.track?.Cues;
    if (cues) {
        apiQuery = Object.assign(
            apiQuery,
            ...cues.map((cue) => ({
                [getCueObjectKey(cue)]: cue.Description,
            })),
        );
    }
    console.debug('TrackSharingDialog::trackUrl:apiQuery:', apiQuery);

    //Build the URL
    const route = {
        name: 'Play',
        query: apiQuery,
    } as unknown as RouteLocationRaw;
    return (
        window.location.protocol +
        '//' +
        window.location.host +
        window.location.pathname +
        router.resolve(route).href
    );
});

import { isClient } from '@vueuse/shared';
import { useShare } from '@vueuse/core';
import { useRouter, type RouteLocationRaw } from 'vue-router';

const options = ref({
    title: 'Replayer link',
    text: props.track?.Name,
    url: isClient ? trackUrl.value : '',
});

const { share, isSupported } = useShare(options);

function startSharingTrack() {
    if (isSupported.value) {
        // use the system's sharing via the Web Share API
        console.debug(`sharing via the Web Share API`);

        return share().catch((err) => console.error(err));
    } else {
        // use the explicit share dialog
        console.debug(`sharing via the app dialog`);
        shareTrack(props.track).then((ok) => {
            if (ok) {
                console.debug(`TrackHeader::sharing done`);
            }
        });
    }
}
</script>
