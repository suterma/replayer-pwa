<template>
    <Experimental>
        <div class="block">
            <section class="hero is-danger is-small">
                <div class="hero-body">
                    <p class="title">Upcoming features for evaluation</p>
                    <p class="subtitle">Use with caution</p>
                </div>
            </section>
        </div>

        <h1 class="title has-text-danger">Tests</h1>

        <h2 class="subtitle has-text-danger">API tests</h2>
        <div class="content">
            <p>These API calls should work (if CORS is disabled)</p>
            <ul>
                <li>
                    Loading a media URL (downloading the media file, creating a
                    track):
                    <a
                        href="http://localhost:8080/#/play?media=https%3A%2F%2Fwww.christoffankhauser.ch%2Fapp%2Fdownload%2F15906779025%2FGwBl15_I%2520danke%2520Dir-Pb.mp3%3Ft%3D1496741278"
                        target="_blank"
                    >
                        Christof Fankhauser Danke Dir Media link
                    </a>
                </li>
                <li>
                    <a
                        href="http://localhost:8080/#/play?media=https%3A%2F%2Fweb.replayer.app%2Fmusic%2Fyour-light-by-lidija-roos.mp3&title=Your%20Light&artist=Lidija%20Roos&album=Not%20For%20Sale&6.49=Intro"
                        target="_blank"
                    >
                        API test with Lidija Roos</a
                    >
                </li>
                <li>
                    <a
                        href="http://localhost:8080/#/play?media=https%3A%2F%2Fweb.replayer.app%2Fmusic%2Fyour-light-by-lidija-roos.mp3&title=Your%20Light&artist=Lidija%20Roos&album=Not%20For%20Sale&6.49=Intro&12=twelve"
                        target="_blank"
                    >
                        API test with 2 Cues with Lidija Roos</a
                    >
                </li>
                <li>
                    <a
                        href="http://localhost:8080/#/play?package=https%3A%2F%2Fweb.replayer.app%2Fmusic%2Fdemo-compilation-featuring-lidija-roos.rez"
                        alt="Link to the Replayer app demo"
                        target="_blank"
                    >
                        API test with Demo package (absolute URL)</a
                    >
                </li>
                <li>
                    <a
                        href="http://localhost:8080/#/play?package=%2Fdemo-compilation-featuring-lidija-roos.rez"
                        alt="Link to the Replayer app demo"
                        target="_blank"
                    >
                        API test with Demo package (relative URL)</a
                    >
                </li>
            </ul>
        </div>

        <h2 class="subtitle has-text-danger">Bindings</h2>
        <div class="field">
            <label class="label">Selected Cue Id ({{ selectedCueId }})</label>
            <div class="control">
                <input
                    class="input"
                    type="text"
                    v-model="selectedCueId"
                    placeholder="Selected Cue Id"
                />
            </div>
        </div>
        <div
            class="field"
            v-if="compilation.Tracks[0] && compilation.Tracks[0].Cues[0]"
        >
            <label class="label"
                >Description of first cue of first track ({{
                    firstCueOfFirstTrack
                }})</label
            >
            <div class="control">
                <input
                    class="input"
                    type="text"
                    v-model="compilation.Tracks[0].Cues[0].Description"
                    placeholder="Description of first cue of first track"
                />
            </div>
        </div>
        <div class="field" v-if="compilation.Tracks[0]">
            <label class="label"
                >BPM of first track ({{ bpmOfFirstTrack }})</label
            >
            <div class="control">
                <input
                    class="input"
                    type="text"
                    v-model="compilation.Tracks[0].BeatsPerMinute"
                    placeholder="BPM of first track"
                />
            </div>
        </div>

        <h2 class="subtitle has-text-danger">
            Loader component with various compilations
        </h2>
        <div class="content">
            <p>
                Try one of the various compilations to check out the various
                features:
            </p>
            <ul>
                <li>
                    <a href="/#/play/demo-compilation-featuring-lidija-roos.rez"
                        >Demo package with a compilation featuring Lidija
                        Roos</a
                    ><br />
                    A REZ Package containing an REX compilation with 2 tracks
                    and matching mp3 files.
                </li>
                <li>
                    <a href="/#/play/Demo%20Adonia%20Junior%2021.bplist"
                        >Demo Binary Property List compilation (as from the
                        LivePlayback app)</a
                    ><br />
                    A bplist file with 21 tracks (no media files).
                </li>
            </ul>
        </div>

        <h2 class="subtitle has-text-danger">Log test buttons</h2>
        <div class="buttons">
            <button class="button is-success" @click="writeDebug">
                A debug log
            </button>

            <button class="button is-info" @click="writeLog">A log</button>
            <button class="button is-warning" @click="writeWarnLog">
                A warning
            </button>
            <button class="button is-danger" @click="writeErrorLog">
                Something dangerous
            </button>
            <button
                class="button is-danger has-text-dark"
                @click="throwException"
            >
                Throw an exception
            </button>
        </div>

        <h1 class="title has-text-danger">Spotify embedding</h1>
        <iframe
            style="border-radius: 12px"
            src="https://open.spotify.com/embed/track/6tNDVXXaYWsBd3Mqhfelvl?utm_source=generator&theme=0"
            width="100%"
            height="80"
            frameBorder="0"
            allowfullscreen="false"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        ></iframe>

        <h1 class="title has-text-danger">Icons test</h1>
        <BaseIcon v-once :path="rTrackPlay" />
        <BaseIcon v-once :path="rTrackRepeat" />
        <BaseIcon v-once :path="rTrackPlayOnce" />
        <BaseIcon v-once :path="rTrackRepeatOnce" />
        <BaseIcon v-once :path="rRepeatVariant" />
        <BaseIcon v-once :path="rShuffleVariant" />
        <NavButton :iconPath="mdiPencil" title="some test title" />
        <CollapsibleButton
            v-model="isExpanded"
            collapsedText="Show 11 somethings"
            expandedText="Hide all this stuff"
        />
        (Is expanded: {{ isExpanded }})

        <h3>Buttons with icons</h3>
        <p>
            Icons are "Inline SVG's from from https://materialdesignicons.com/
        </p>
    </Experimental>

    <h3>Control knobs</h3>

    <ControlKnob id="knob1" v-model="knobValue" />
    <ControlKnob
        class="button is-knob is-unselectable"
        id="knob2"
        v-model="knobValue"
        :options="{
            imageSize: 40,
            hideDefaultValue: false,
            valueTextX: 50,
            valueTextY: 55,
            tickLength: 20,
            tickOffset: -7,
            tickStroke: 2,
            rimStroke: 4,
            valueArchStroke: 10,
            bgRadius: 39,
            rimClass: 'has-text-warning-dark',
            bgClass: 'has-text-dark',
            tickClass: 'has-text-light',
            ariaLabel: 'Knob',
            svgClass: 'has-text-info',
            valueTextClass: 'has-text-warning',
            valueArchClass: 'has-text-warning',
        }"
    /><Knob :minValue="0" :maxValue="50" v-model="knobValue"></Knob>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import NavButton from '@/components/buttons/NavButton.vue';
//import ControlKnob from '@slipmatio/control-knob';
import ControlKnob from '@/components/control-knob';
import Knob from '@/components/buttons/Knob.vue';
import { mdiPencil } from '@mdi/js';
import {
    rTrackPlay,
    rTrackRepeat,
    rRepeatVariant,
    rShuffleVariant,
    rTrackPlayOnce,
    rTrackRepeatOnce,
} from '@/components/icons/BaseIcon.vue';
import { useAppStore } from '@/store/app';
import { mapState, mapWritableState } from 'pinia';

export default defineComponent({
    name: 'Development',
    components: {
        CollapsibleButton,
        BaseIcon,
        NavButton,
        ControlKnob,
        Knob,
    },
    data() {
        return {
            isExpanded: false,
            isOn: false,
            knobValue: 0,

            /** Icons from @mdi/js */
            mdiPencil: mdiPencil,
            rTrackPlay: rTrackPlay,
            rTrackRepeat: rTrackRepeat,
            rRepeatVariant: rRepeatVariant,
            rShuffleVariant: rShuffleVariant,
            rTrackPlayOnce: rTrackPlayOnce,
            rTrackRepeatOnce: rTrackRepeatOnce,
        };
    },
    methods: {
        writeDebug() {
            console.debug('Just a debug log with an object', { some: 'data' });
        },
        writeLog() {
            console.log('Just a log');
        },
        writeWarnLog() {
            console.warn('A warning');
        },
        writeErrorLog() {
            console.error('Something dangerous');
        },
        throwException() {
            throw 'Something bad happened!';
        },
    },
    computed: {
        ...mapState(useAppStore, ['hasCompilation']),
        ...mapWritableState(useAppStore, ['compilation', 'selectedCueId']),
        firstCueOfFirstTrack(): string | null {
            return this.compilation?.Tracks[0]?.Cues[0]?.Description ?? null;
        },

        bpmOfFirstTrack(): number | null {
            return this.compilation.Tracks[0]?.BeatsPerMinute ?? null;
        },
    },
});
</script>
