<template>
    <div class="container">
        <h1 class="title is-hidden-print">Set list</h1>

        <!-- 
             //TODO add transition group, see example https://sortablejs.github.io/vue.draggable.next/#/transition-example-2
        -->
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
                                    type="checkbox"
                                    v-model="showNumbering"
                                />
                                show numbering
                            </label>
                            <label class="checkbox mr-4">
                                <input type="checkbox" v-model="showCues" />
                                show cues
                            </label>
                            <label class="checkbox mr-4">
                                <input
                                    type="checkbox"
                                    v-model="showMediaSource"
                                />
                                show media source
                            </label>
                            <label class="checkbox mr-4">
                                <input
                                    type="checkbox"
                                    v-model="printTracksOnNewPage"
                                />
                                each track on a new page
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- When not each track is on a new page, show the compilation only once -->

        <h1 class="title is-3" v-if="!printTracksOnNewPage">
            {{ compilation.Title }}
        </h1>
        <draggable
            v-model="orderedTracks"
            @start="drag = true"
            @end="drag = false"
            handle=".handle"
            ghost-class="has-outline-dashed-success"
            drag-class="has-text-success"
            item-key="Id"
        >
            <template #item="{ element, index }">
                <div class="is-together-print">
                    <!-- When each track is on a new page, also show the compilation each time -->

                    <h1 class="title is-3" v-if="printTracksOnNewPage">
                        <span> {{ compilation.Title }}</span>
                    </h1>
                    <SetlistItem
                        :track="element"
                        :showCues="showCues"
                        :showMediaSource="showMediaSource"
                    >
                        <!-- The track index (as part of the title) -->
                        <span v-if="showNumbering">{{ index + 1 }})&nbsp;</span>
                        <template #title-end
                            ><BaseIcon
                                class="handle grabbable is-hidden-print"
                                v-once
                                :path="mdiDrag"
                                title="Drag and drop to reorder"
                        /></template>
                    </SetlistItem>

                    <hr />
                    <template v-if="printTracksOnNewPage">
                        <!-- Page break indicator (shown on screen, but not visually printed) -->
                        <span
                            class="has-text-centered is-size-7 is-unselectable is-hidden-print"
                            style="
                                width: 100%;
                                margin-top: calc(-2.5em - 1px);
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
                </div>
            </template>
        </draggable>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ICompilation, ITrack } from '@/store/compilation-types';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import SetlistItem from '@/components/SetlistItem.vue';
import { mdiDrag, mdiPrinterOutline } from '@mdi/js';
import draggable from 'vuedraggable';
import { MutationTypes } from '@/store/mutation-types';

/** A printable display of a complete compilation, with a track and cue listing */
export default defineComponent({
    name: 'Setlist',
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
            showNumbering: true,
            /** Icons from @mdi/js */
            mdiDrag: mdiDrag,
            mdiPrinterOutline: mdiPrinterOutline,
        };
    },
    computed: {
        compilation(): ICompilation {
            return this.$store.getters.compilation;
        },

        hasCompilation(): boolean {
            return this.$store.getters.hasCompilation;
        },
        orderedTracks: {
            get(): ITrack[] {
                return this.compilation.Tracks;
            },
            set(value: ITrack[]) {
                const orderedTrackIds = value.map((item) => item.Id);
                this.$store.commit(MutationTypes.UPDATE_TRACK_ORDER, {
                    orderedTrackIds,
                });
            },
        },
    },
    methods: {
        printWindow: function () {
            window.print();
        },
    },
});
</script>
<style scoped>
.grabbable {
    cursor: move; /* fallback if grab cursor is unsupported */
    cursor: grab;
    cursor: -moz-grab;
    cursor: -webkit-grab;
}

/* (Optional) Apply a "closed-hand" cursor during drag operation. */
.grabbable:active {
    cursor: grabbing;
    cursor: -moz-grabbing;
    cursor: -webkit-grabbing;
}
</style>
