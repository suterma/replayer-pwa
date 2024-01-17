<template>
    <div class="container">
        <h1 class="title is-hidden-print">Set list</h1>
        <div class="box is-hidden-print">
            <div class="field">
                <div class="control">
                    <button
                        class="button is-success is-pulled-right"
                        @click="printWindow()"
                    >
                        <BaseIcon v-once :path="mdiPrinterOutline" />
                        <span> Print (b/w)</span>
                    </button>
                </div>
            </div>
            <div class="field is-horizontal">
                <div class="field-label">
                    <label class="label">Options</label>
                </div>
                <div class="field-body">
                    <div class="field is-narrow">
                        <div class="control">
                            <label class="checkbox mr-4">
                                <input
                                    v-model="showNumbering"
                                    type="checkbox"
                                />
                                show numbering
                            </label>
                            <label class="checkbox mr-4">
                                <input v-model="showCues" type="checkbox" />
                                show cues
                            </label>
                            <label class="checkbox mr-4">
                                <input
                                    v-model="showMediaSource"
                                    type="checkbox"
                                />
                                show media source
                            </label>
                            <label class="checkbox mr-4">
                                <input
                                    v-model="printTracksOnNewPage"
                                    type="checkbox"
                                />
                                each track on a new page
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- When not each track is on a new page, show the compilation only once -->

        <h1 v-if="!printTracksOnNewPage" class="title is-3">
            {{ compilation.Title }}
        </h1>
        <table class="table is-fullwidth">
            <draggable
                v-model="orderedTracks"
                handle=".handle"
                ghost-class="drag-ghost"
                drag-class="drag"
                item-key="Id"
                :animation="200"
                tag="tbody"
                :component-data="{
                    tag: 'tbody',
                    type: 'transition-group',
                    name: !drag ? 'flip-list' : null,
                }"
                data-cy="track-list"
                @start="drag = true"
                @end="drag = false"
            >
                <template #item="{ element, index }">
                    <tr class="is-together-print" data-cy="track-list-item">
                        <td>
                            <!-- When each track is on a new page, also show the compilation each time -->

                            <h1 v-if="printTracksOnNewPage" class="title is-3">
                                <span> {{ compilation.Title }}</span>
                            </h1>
                            <SetlistItem
                                :track="element"
                                :show-cues="showCues"
                                :show-media-source="showMediaSource"
                            >
                                <!-- The track index (as part of the title) -->
                                <span v-if="showNumbering" class="mr-2"
                                    >{{ index + 1 }})&nbsp;</span
                                >
                                <template #title-end
                                    ><BaseIcon
                                        v-once
                                        class="grabbable handle is-hidden-print"
                                        :path="mdiDrag"
                                        title="Drag and drop to reorder"
                                        data-cy="drag-handle"
                                /></template>
                            </SetlistItem>

                            <template v-if="printTracksOnNewPage">
                                <!-- Page break indicator (shown on screen, but not visually printed) -->
                                <span
                                    class="has-text-centered is-size-7 is-unselectable is-hidden-print"
                                    style="
                                        width: 100%;
                                        margin-top: -2px;
                                        position: absolute;
                                    "
                                    ><span
                                        style="background-color: #272b30"
                                        class="pl-2 pr-3"
                                        >Page break</span
                                    ></span
                                >
                                <!-- Page break, if requested, but no on last page -->
                                <div
                                    v-if="!(index + 1 === orderedTracks.length)"
                                    class="has-page-break-after"
                                ></div>
                            </template>
                        </td>
                    </tr>
                </template>
            </draggable>
        </table>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import SetlistItem from '@/components/SetlistItem.vue';
import { mdiDrag, mdiPrinterOutline } from '@mdi/js';
import draggable from 'vuedraggable';
import { mapActions } from 'pinia';
import { useAppStore } from '@/store/app';
import { mapState } from 'pinia';
import type { ITrack } from '@/store/ITrack';

/** A printable display of a complete compilation, with a track and cue listing */
export default defineComponent({
    name: 'SetlistView',
    components: {
        BaseIcon,
        SetlistItem,
        draggable,
    },
    data() {
        return {
            drag: false,
            /** Whether to print each track on a new page */
            printTracksOnNewPage: false,
            /** Whether to show the cues
             * @remarks Default is true
             */
            showCues: false,
            /** Whether to show the media source */
            showMediaSource: false,
            /** Whether to show the media source */
            showNumbering: false,
            /** Icons from @mdi/js */
            mdiDrag: mdiDrag,
            mdiPrinterOutline: mdiPrinterOutline,
        };
    },
    computed: {
        ...mapState(useAppStore, [
            'compilation',
            'hasCompilation',
            'mediaTracks',
        ]),

        orderedTracks: {
            get(): ITrack[] {
                return this.mediaTracks;
            },
            set(value: ITrack[]) {
                const orderedTrackIds = value.map((item) => item.Id);
                this.updateTrackOrder(orderedTrackIds);
            },
        },
    },
    methods: {
        ...mapActions(useAppStore, ['updateTrackOrder']),

        printWindow: function () {
            window.print();
        },
    },
});
</script>
import { type ITrack } from '@/store/ITrack';
