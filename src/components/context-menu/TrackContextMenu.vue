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
                v-if="track"
                title="Add multiple cues..."
                subTitle="(add cues using text lines)"
                @click="addMultipleCues()"
            />
            <DropdownMenuButton
                v-if="track"
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
import { addTextCues, confirm, shareTrack } from '@/code/ui/dialogs';
import { ICue, ITrack } from '@/store/compilation-types';
import CompilationHandler from '@/store/compilation-handler';
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
                            this.$store.commit(MutationTypes.ADD_CUE, {
                                trackId,
                                cue,
                            });
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
        removeTrack() {
            confirm(
                'Removing track',
                `Do you want to remove track "${this.trackName}"?`,
            ).then((ok) => {
                if (ok) {
                    this.$store.dispatch(
                        ActionTypes.REMOVE_TRACK,
                        this.trackId,
                    );
                }
            });
        },
        /** Clones the track by creating a deep copy
         */
        cloneTrack() {
            this.$store.dispatch(ActionTypes.CLONE_TRACK, this.trackId);
        },
        moveUp() {
            this.$store.commit(MutationTypes.MOVE_TRACK_UP, this.trackId);
        },
        moveDown() {
            this.$store.commit(MutationTypes.MOVE_TRACK_DOWN, this.trackId);
        },

        /** Reassign shortcut
         * @remarks Uses the first shortcut mnemonic as seed, then incrementing the number
         */
        reassignCueShortcuts() {
            console.debug(
                `TrackContextMenu::reassignCueShortcuts:trackId:${this.trackId}`,
            );

            this.$store.commit(
                MutationTypes.REASSIGN_CUE_SHORTCUTS,
                this.trackId,
            );
        },
    },
    computed: {
        /** The currently available tracks in the compilation
         */
        tracks(): Array<ITrack> | undefined {
            const tracks = this.$store.getters.tracks as
                | Array<ITrack>
                | undefined;

            return tracks;
        },

        /** The track for the context, if any
         */
        track(): ITrack | undefined {
            if (this.tracks && this.trackId) {
                return CompilationHandler.getTrackById(
                    this.tracks,
                    this.trackId,
                );
            }
            return undefined;
        },
    },
});
</script>
