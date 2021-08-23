<template>
    <div>
        <div>
            {{ track.Name }} ( by {{ track.Artist }} on {{ track.Album }} )
            <small>{{ track.Url }})</small>
        </div>
        <div>
            <template v-for="cue in cues" :key="cue.Id">
                <CueDisplay :cue="cue" /> &nbsp;
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track, ICue } from '@/store/compilation-types';
import CueDisplay from '@/components/CueDisplay.vue';

export default defineComponent({
    name: 'TrackDisplay',
    components: { CueDisplay },
    props: {
        track: Track,
    },
    methods: {},
    computed: {
        cues(): Array<ICue> | undefined {
            return this.track?.Cues;
        },
        //TODO display the ready-state of the corresponding file object
    },
});
</script>
