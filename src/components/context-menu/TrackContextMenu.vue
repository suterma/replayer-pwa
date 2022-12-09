<template>
    <DropdownMenu title="Track context menu">
        <DropdownMenuButton
            :disabled="isFirstTrack"
            title="Move up"
            subTitle="(to an earlier position)"
            @click="moveUp()"
            :iconPath="mdiTransferUp"
        />
        <DropdownMenuButton
            :disabled="isLastTrack"
            title="Move down"
            subTitle="(to a later position)"
            @click="moveDown()"
            :iconPath="mdiTransferDown"
        />
        <Experimental v-once>
            <DropdownMenuButton
                title="Share..."
                subTitle="(allows to share a track)"
                @click="share()"
            />
        </Experimental>

        <DropdownMenuButton
            v-once
            title="Clone"
            subTitle="(with cues and media)"
            @click="cloneTrack()"
            :iconPath="mdiContentDuplicate"
        />
        <DropdownMenuButton
            v-once
            title="Reassign cue shortcuts"
            subTitle="(first as seed, then incrementing)"
            @click="reassignCueShortcuts()"
            :iconPath="mdiOrderNumericAscending"
        />
        <hr class="dropdown-divider" />
        <DropdownMenuButton
            v-once
            title="Remove"
            subTitle="(remove
                            the track from the compilation)"
            @click="removeTrack()"
            :iconPath="mdiTrashCanOutline"
        />
    </DropdownMenu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import DropdownMenuButton from '@/components/dropdown-menu/DropdownMenuButton.vue';
import {
    mdiTransferUp,
    mdiTransferDown,
    mdiContentDuplicate,
    mdiTrashCanOutline,
    mdiOrderNumericAscending,
} from '@mdi/js';
import { ActionTypes } from '@/store/action-types';
import { MutationTypes } from '@/store/mutation-types';
import { confirm, shareTrack } from '@/code/ui/dialogs';
import { Track } from '@/store/compilation-types';
/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'TrackContextMenu',
    components: { DropdownMenu, DropdownMenuButton },
    props: {
        isFirstTrack: {
            type: Boolean,
            required: true,
        },
        isLastTrack: {
            type: Boolean,
            required: true,
        },
        track: {
            type: Track,
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

      share() {
            shareTrack(this.track).then((ok) => {
                if (ok) {
                    console.debug(`TrackHeader::sharing done`);
                }
            });
        },
        /** Removes the track from the compilation
         */
        removeTrack() {
            confirm(
                'Removing track',
                `Do you want to remove track "${this.track.Name}"?`,
            ).then((ok) => {
                if (ok) {
                    this.$store.dispatch(
                        ActionTypes.REMOVE_TRACK,
                        this.track.Id,
                    );
                }
            });
        },
        /** Clones the track by creating a deep copy
         */
        cloneTrack() {
            this.$store.dispatch(ActionTypes.CLONE_TRACK, this.track.Id);
        },
        moveUp() {
            this.$store.commit(MutationTypes.MOVE_TRACK_UP, this.track.Id);
        },
        moveDown() {
            this.$store.commit(MutationTypes.MOVE_TRACK_DOWN, this.track.Id);
        },

        /** Reassign shortcut
         * @remarks Uses the first shortcut mnemonic as seed, then incrementing the number
         */
        reassignCueShortcuts() {
            console.debug(
                `TrackContextMenu::reassignCueShortcuts:trackId:${this.track.Id}`,
            );

            this.$store.commit(
                MutationTypes.REASSIGN_CUE_SHORTCUTS,
                this.track.Id,
            );
        },
    },
});
</script>
