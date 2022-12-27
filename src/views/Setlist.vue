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

        <div
            v-for="(track, index) in compilation.Tracks"
            :key="track.Id"
            class="is-together-print"
        >
            <!-- When each track is on a new page, also show the compilation each time -->
            <h1 class="title is-3" v-if="printTracksOnNewPage">
                <span> {{ compilation.Title }}</span>
            </h1>
            <SetlistItem
                :track="track"
                :showCues="showCues"
                :showMediaSource="showMediaSource"
            >
                <!-- The track index (as part of the title) -->
                <span class="ml-2 is-size-7"
                    >(Track {{ index + 1 }}/{{
                        compilation.Tracks.length
                    }})</span
                >
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
                    ><span style="background-color: #272b30" class="pl-2 pr-3"
                        >Page break</span
                    ></span
                >
                <!-- Page break, if requested, but no on last page -->
                <div
                    v-if="!(index + 1 === compilation.Tracks.length)"
                    class="has-page-break-after"
                ></div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ICompilation } from '@/store/compilation-types';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import SetlistItem from '@/components/SetlistItem.vue';
import { mdiPrinterOutline } from '@mdi/js';

/** A printable display of a complete compilation, with a track and cue listing */
export default defineComponent({
    name: 'Setlist',
    components: {
        BaseIcon,
        SetlistItem,
    },
    data() {
        return {
            /** Whether to print each track on a new page */
            printTracksOnNewPage: false,
            /** Whether to show the cues
             * @remarks Default is true
             */
            showCues: true,
            /** Whether to show the media source */
            showMediaSource: true,

            /** Icons from @mdi/js */
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
    },
    methods: {
        printWindow: function () {
            window.print();
        },
    },
});
</script>
