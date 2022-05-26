<template>
    <Experimental>
        <button
            class="button is-success is-pulled-right is-medium"
            @click="printWindow()"
        >
            Print (b/w)
        </button>

        <h1 class="title is-3">{{ compilation.Title }}</h1>

        <template v-for="track in compilation.Tracks" :key="track.Id">
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
                            <p class="tag is-black is-family-monospace">
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
        </template>
    </Experimental>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ICompilation, TrackDisplayMode } from '@/store/compilation-types';
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
            /** Whether the compilation is shown as editable */
            tracksDisplayMode: TrackDisplayMode.Link,
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
