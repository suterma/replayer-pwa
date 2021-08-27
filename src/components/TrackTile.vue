<template>
    <!-- Each track is a tile (vertically distributed), and contains all the cues -->
    <div class="tile is-ancestor">
        <div class="tile is-vertical is-parent">
            <div class="tile is-child box has-background-info-light">
                <h2 class="subtitle">
                    {{ track.Name }}

                    <span class="is-pulled-right is-size-7 has-text-right">
                        <span v-if="track.Artist" class="has-opacity-half">
                            by
                        </span>
                        <span class="is-italic">
                            {{ track.Artist }}
                        </span>
                        <br />
                        <span v-if="track.Album" class="has-opacity-half">
                            on
                        </span>
                        <span class="is-italic">
                            {{ track.Album }}
                        </span>
                    </span>
                </h2>

                <div class="buttons">
                    <template v-for="cue in cues" :key="cue.Id">
                        <CueButton :cue="cue" />
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Track, ICue } from '@/store/compilation-types'
import CueButton from '@/components/CueButton.vue'

export default defineComponent({
    name: 'TrackTile',
    components: { CueButton },
    props: {
        track: Track,
    },
    methods: {},
    computed: {
        cues(): Array<ICue> | undefined {
            return this.track?.Cues
        },
        //TODO display the ready-state of the corresponding file object
    },
})
</script>
<style scoped>
.has-opacity-half {
    opacity: 50%;
}
</style>
