<template>
    <Experimental>
        <div class="box is-pulled-right is-hidden-print is-unselectable">
            <div class="field">
                <div class="control">
                    <label class="checkbox">
                        <input type="checkbox" v-model="printTracksOnNewPage" />
                        Print each track on a new page
                    </label>
                </div>
            </div>
            <div class="field">
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
        </div>
        <!-- When not each track is on a new page, show the compilation only once -->

        <h1 class="title is-3" v-if="!printTracksOnNewPage">
            {{ compilation.Title }}
        </h1>

        <template v-for="track in compilation.Tracks" :key="track.Id">
            <div class="block is-together-print">
                <!-- When each track is on a new page, also show the compilation each time -->
                <h1 class="title is-3" v-if="printTracksOnNewPage">
                    {{ compilation.Title }}
                </h1>
                <h2 class="title has-text-weight-light is-4">
                    {{ track.Name }}
                    <span class="is-size-7">
                        <ArtistInfo :track="track" />
                    </span>
                </h2>
                <h3 class="subtitle">
                    <span class="is-size-7">
                        {{ track.Url }}
                    </span>
                    <span class="is-size-7" v-if="track.Duration">
                        ({{ displayTime(track.Duration) }})
                    </span>
                </h3>

                <table class="table is-narrow">
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
            </div>
            <!-- Page break (indicated on screen, but issued on print) -->
            <hr v-if="printTracksOnNewPage" class="has-page-break-after" />
        </template>
        <section class="hero has-border is-together-print">
            <div class="hero-body">
                <div class="box is-pulled-right">
                    <img
                        alt="QR image for https://.replayer.app"
                        width="150"
                        height="150"
                        src="data:image/png;base64,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"
                    /><br />
                    https://replayer.app
                </div>
                <p class="title">Replayer</p>
                <p class="subtitle">
                    Your rehearsal / audition / performance on cue
                </p>
                <p>
                    Replayer is a free, cue-based media player for rehearsals
                    with playback music. By the click of a button, Replayer
                    starts to play at predefined times in the audio file.
                </p>
            </div>
        </section>
    </Experimental>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ICompilation } from '@/store/compilation-types';
import ArtistInfo from '@/components/ArtistInfo.vue';
import Experimental from '@/components/Experimental.vue';
import Icon from '@/components/icons/Icon.vue';
import CompilationHandler from '@/store/compilation-handler';

/** A printable display of a complete compilation, with a simple track and cue listing */
export default defineComponent({
    name: 'PrintableList',
    components: {
        Experimental,
        ArtistInfo,
        Icon,
    },
    data() {
        return {
            /** Whether to print each track on a new page */
            printTracksOnNewPage: false,
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
