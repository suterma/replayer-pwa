<template>
    <Experimental>
        <section class="hero">
            <div class="hero-body">
                <p class="title">Primary hero</p>
                <p class="subtitle">Primary subtitle</p>
                //TODO add info box about Replayer, the shortcuts and a link
                (including QR code) Also do header and footer maybes
            </div>
        </section>

        <div class="box is-pulled-right is-hidden-print">
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
                        class="button is-success is-medium is-hidden-print"
                        @click="printWindow()"
                    >
                        Print (b/w)
                    </button>
                </div>
            </div>
        </div>

        <h1 class="title is-3">{{ compilation.Title }}</h1>

        <template v-for="track in compilation.Tracks" :key="track.Id">
            <div class="block is-together-print">
                <h2 class="title has-text-weight-light is-4">
                    {{ track.Name }}
                </h2>

                <table class="table is-narrow">
                    <tbody>
                        <tr v-for="cue in track.Cues" :key="cue.Id">
                            <!-- <td
                            class="button is-black is-outlined is-family-monospace"
                        >
                            {{ cue.Shortcut }}
                        </td> -->
                            <td>
                                <p
                                    class="tag is-light is-outlined foreground has-opacity-third is-family-monospace"
                                >
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
    </Experimental>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ICompilation } from '@/store/compilation-types';
import Experimental from '@/components/Experimental.vue';
import CompilationHandler from '@/store/compilation-handler';

/** A printable display of a complete compilation, with a simple track and cue listing */
export default defineComponent({
    name: 'PrintableList',
    components: {
        Experimental,
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
<style scoped>
@media print {
    * {
        opacity: 100%;
    }
    .has-page-break-after {
        break-after: page;
    }
}
</style>
