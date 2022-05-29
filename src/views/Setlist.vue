<template>
    <div class="block">
        <section class="hero is-hidden-print is-unselectable">
            <div class="hero-body">
                <div class="block">
                    <p class="title">Set list</p>
                    <p>
                        The set list allows you to review and print the
                        compilation, in a suitable format.
                    </p>
                </div>
                <div class="block">
                    <div class="field is-pulled-right">
                        <div class="control">
                            <button
                                class="button is-success is-hidden-print"
                                @click="printWindow()"
                            >
                                <Icon name="printer-outline" />
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
                                            v-model="showCues"
                                        />
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
            </div>
        </section>
    </div>
    <div class="block">
        <!-- When not each track is on a new page, show the compilation only once -->

        <h1 class="title is-3" v-if="!printTracksOnNewPage">
            {{ compilation.Title }}
        </h1>

        <template v-for="(track, index) in compilation.Tracks" :key="track.Id">
            <div class="block is-together-print">
                <!-- When each track is on a new page, also show the compilation each time -->
                <h1 class="title is-3" v-if="printTracksOnNewPage">
                    <span> {{ compilation.Title }}</span>
                </h1>
                <h2 class="title has-text-weight-light is-4">
                    <span>{{ track.Name }}</span>
                    <span class="ml-2 is-size-7"
                        >({{ index + 1 }}/{{ compilation.Tracks.length }})</span
                    >
                    <span
                        v-if="track.Artist || track.Album"
                        class="is-size-7 ml-2"
                    >
                        <ArtistInfo :track="track" />
                    </span>
                </h2>
                <h3 v-if="showMediaSource" class="subtitle">
                    <span class="is-size-7">
                        {{ track.Url }}
                    </span>
                    <span class="is-size-7" v-if="track.Duration">
                        ({{ displayTime(track.Duration) }})
                    </span>
                </h3>

                <table v-if="showCues" class="table is-narrow">
                    <thead>
                        <tr>
                            <th class="is-size-7">Shortcut</th>
                            <th class="is-size-7">Description</th>
                            <th class="is-size-7">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="cue in track.Cues" :key="cue.Id">
                            <td>
                                <p class="tag has-border is-family-monospace">
                                    {{ cue.Shortcut }}
                                </p>
                            </td>
                            <td class="">
                                {{ cue.Description }}
                            </td>
                            <td class="">
                                {{ displayTime(cue.Time) }}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <hr />
                <!-- Page break indicator (shown on screen, but not visually printed) -->
                <span
                    v-if="printTracksOnNewPage"
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
            </div>
            <!-- Page break, if requested, but no on last page -->
            <div
                v-if="
                    printTracksOnNewPage &&
                    !(index + 1 === compilation.Tracks.length)
                "
                class="has-page-break-after"
            ></div>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ICompilation } from '@/store/compilation-types';
import ArtistInfo from '@/components/ArtistInfo.vue';
import Icon from '@/components/icons/Icon.vue';
import CompilationHandler from '@/store/compilation-handler';

/** A printable display of a complete compilation, with a track and cue listing */
export default defineComponent({
    name: 'Setlist',
    components: {
        ArtistInfo,
        Icon,
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
        /** Converts the a time into a conveniently displayable hh:mm:ss.s format.
         * @remarks Omits the hour part, if not appliccable
         */
        displayTime(value: number | null): string {
            return CompilationHandler.convertToDisplayTime(value, 1);
        },
        printWindow: function () {
            window.print();
        },
    },
});
</script>
