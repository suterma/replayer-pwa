<!--
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
-->
<template>
    <div>
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

        <!-- Selectable tags -->
        <TagsSelector
            v-if="compilationHasTags && experimentalUseTags"
            v-experiment="experimentalUseTags"
            :all-tags="getAllTags"
            :selected-tags="selectedTags"
            @selected="selectTag"
            @deselected="deselectTag"
        ></TagsSelector>

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

<script setup lang="ts">
/** A printable display of a complete compilation, with a track and cue listing */
import { computed, ref } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import SetlistItem from '@/components/SetlistItem.vue';
import { mdiDrag, mdiPrinterOutline } from '@mdi/js';
import draggable from 'vuedraggable';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/store/app';
import type { ITrack } from '@/store/ITrack';
import { useSettingsStore } from '@/store/settings';
import TagsSelector from '@/components/editor/TagsSelector.vue';

const drag = ref(false);

/** Whether to print each track on a new page */
const printTracksOnNewPage = ref(false);

/** Whether to show the cues
 * @remarks Default is true
 */
const showCues = ref(false);

/** Whether to show the media source */
const showMediaSource = ref(false);

/** Whether to show the numbering */
const showNumbering = ref(false);

const app = useAppStore();
const { compilation, allTracks, getAllTags } = storeToRefs(app);

const orderedTracks = computed<ITrack[]>({
    get(): ITrack[] {
        return allTracks.value;
    },
    set(value: ITrack[]) {
        const orderedTrackIds = value.map((item) => item.Id);
        app.updateTrackOrder(orderedTrackIds);
    },
});

function printWindow() {
    window.print();
}

// --- Tag handling ---

const settings = useSettingsStore();
const { experimentalUseTags } = storeToRefs(settings);

const compilationHasTags = computed(() => {
    return getAllTags.value.size > 0;
});

const { selectedTags } = storeToRefs(app);

function selectTag(tag: string) {
    console.debug('selectTag', tag);

    selectedTags.value.add(tag);
}
function deselectTag(tag: string) {
    console.debug('deselectTag', tag);

    selectedTags.value.delete(tag);
}
</script>
