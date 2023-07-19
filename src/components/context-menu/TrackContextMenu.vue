<template>
    <DropdownMenu title="Track context menu">
        <DropdownMenuItem
            v-once
            v-if="track"
            title="Add multiple cues..."
            subTitle="(add cues using text lines)"
            @click="addMultipleCues()"
        />
        <DropdownMenuItem
            v-once
            title="Reassign cue shortcuts"
            subTitle="(first as seed, then incrementing)"
            @click="reassignCueShortcuts(trackId)"
            :iconPath="mdiOrderNumericAscending"
        />
        <DropdownMenuItem
            v-once
            v-experiment="experimentalAllowTrackSharingByLink"
            v-if="track"
            title="Share..."
            subTitle="(allows to share a track)"
            @click="share()"
        />
        <hr class="dropdown-divider" />
        <DropdownMenuItem
            v-once
            title="Clone"
            subTitle="(with cues and media)"
            @click="cloneTrack(trackId)"
            :iconPath="mdiContentDuplicate"
        />
        <DropdownMenuItem
            v-once
            title="Remove"
            subTitle="(remove
                            the track from the compilation)"
            @click="remove()"
            :iconPath="mdiTrashCanOutline"
        />
    </DropdownMenu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import DropdownMenuItem from '@/components/dropdown-menu/DropdownMenuItem.vue';
import {
    mdiTransferUp,
    mdiTransferDown,
    mdiContentDuplicate,
    mdiTrashCanOutline,
    mdiOrderNumericAscending,
} from '@mdi/js';
import { addTextCues, confirm, shareTrack } from '@/code/ui/dialogs';
import { ICue, ITrack } from '@/store/compilation-types';
import { mapActions } from 'pinia';
import { useAppStore } from '@/store/app';
import { useSettingsStore } from '@/store/settings';
import { mapState } from 'pinia';

/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'TrackContextMenu',
    components: { DropdownMenu, DropdownMenuItem },
    props: {
        isFirstTrack: {
            type: Boolean,
            required: true,
        },
        isLastTrack: {
            type: Boolean,
            required: true,
        },
        trackName: {
            type: String,
            required: true,
        },
        trackId: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            /** Icons from @mdi/js */
            mdiTrashCanOutline: mdiTrashCanOutline,
            mdiOrderNumericAscending: mdiOrderNumericAscending,
            mdiContentDuplicate: mdiContentDuplicate,
            mdiTransferDown: mdiTransferDown,
            mdiTransferUp: mdiTransferUp,
        };
    },
    methods: {
        ...mapActions(useAppStore, [
            'addCue',
            'removeTrack',
            'cloneTrack',
            'reassignCueShortcuts',
        ]),

        share() {
            if (this.track) {
                shareTrack(this.track).then((ok) => {
                    if (ok) {
                        console.debug(`TrackHeader::sharing done`);
                    }
                });
            }
        },
        addMultipleCues() {
            if (this.track) {
                addTextCues(this.track).then((cues: ICue[]) => {
                    if (cues) {
                        const trackId = this.trackId;
                        cues.forEach((cue) => {
                            this.addCue(trackId, cue);
                        });

                        console.debug(
                            `TrackHeader::adding multiple cues from text done`,
                        );
                    }
                });
            }
        },
        /** Removes the track from the compilation
         */
        remove() {
            confirm(
                'Removing track',
                `Do you want to remove track "${this.trackName}"?`,
            ).then((ok) => {
                if (ok) {
                    this.removeTrack(this.trackId);
                }
            });
        },
    },
    computed: {
        ...mapState(useSettingsStore, ['experimentalAllowTrackSharingByLink']),
        /** The track for the context, if any
         */
        track(): ITrack | undefined {
            return useAppStore().getTrackById(this.trackId);
        },
    },
});
</script>
