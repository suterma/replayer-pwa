<!--
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
-->
<template>
    <div v-experiment="true">
        <div class="block">
            <section class="hero is-danger is-small">
                <div class="hero-body">
                    <p class="title">Upcoming features for evaluation</p>
                    <p class="subtitle">Use with caution</p>
                </div>
            </section>
        </div>

        <div class="block">
            <h1 class="title has-text-danger">Icons test</h1>
            <div class="buttons">
                <button class="button toggle-item is-rounded">
                    <BaseIcon v-once :path="rTrackPlay" />
                    <span>rTrackPlay</span>
                </button>
                <button class="button toggle-item is-rounded">
                    <BaseIcon v-once :path="rTrackRepeat" />
                    <span>rTrackRepeat</span>
                </button>
                <button class="button toggle-item is-rounded">
                    <BaseIcon v-once :path="rTrackPlayOnce" />
                    <span>rTrackPlayOnce</span>
                </button>
                <button class="button toggle-item is-rounded">
                    <BaseIcon v-once :path="rTrackRepeatOnce" />
                    <span>rTrackRepeatOnce</span>
                </button>
                <button class="button toggle-item is-rounded">
                    <BaseIcon v-once :path="rRepeatVariant" />
                    <span>rRepeatVariant</span>
                </button>
                <button class="button toggle-item is-rounded">
                    <BaseIcon v-once :path="rShuffleVariant" />
                    <span>rShuffleVariant</span>
                </button>
                <button class="button toggle-item is-rounded">
                    <BaseIcon v-once :path="rFadeInFadeOutOff" />
                    <span>rFadeInFadeOutOff</span>
                </button>
                <button class="button toggle-item is-rounded">
                    <BaseIcon v-once :path="rFadeInFadeOutOn" />
                    <span>rFadeInFadeOutOn</span>
                </button>

                <button class="button toggle-item is-rounded">
                    <BaseIcon v-once :path="rPlayPreplay" />
                    <span>rPlayPreplay</span>
                </button>

                <button class="button toggle-item is-rounded">
                    <BaseIcon v-once :path="rPlayDirect" />
                    <span>rPlayDirect</span>
                </button>

                <hr />

                <button class="button toggle-item is-rounded">
                    <BaseIcon v-once :path="rFadeInPreRollPlay" />
                    <span>rFadeInPreRollPlay</span>
                </button>

                <button class="button toggle-item is-rounded">
                    <BaseIcon v-once :path="rPlayFadeIn" />
                    <span>rPlayFadeIn</span>
                </button>

                <button class="button toggle-item is-rounded">
                    <BaseIcon v-once :path="rFadeInPlay" />
                    <span>rFadeInPlay</span>
                </button>

                <button class="button toggle-item is-rounded">
                    <BaseIcon v-once :path="rPreRollPlay" />
                    <span>rPreRollPlay</span>
                </button>
            </div>
            <NavButton :icon-path="mdiPencil" title="some test title" />
            <CollapsibleButton
                v-model="isExpanded"
                collapsed-text="Show 11 somethings"
                expanded-text="Hide all this stuff"
            />
            (Is expanded: {{ isExpanded }})

            <h3>Buttons with icons</h3>
            <p>
                Icons are "Inline SVG's from from
                https://materialdesignicons.com/
            </p>
        </div>

        <div class="block">
            <CollapsiblePanel>
                <template #caption
                    ><h1 class="title has-text-danger">
                        Spotify embedding
                    </h1></template
                >
                <iframe
                    style="border-radius: 12px"
                    src="https://open.spotify.com/embed/track/6tNDVXXaYWsBd3Mqhfelvl?utm_source=generator&theme=0"
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allowfullscreen="false"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                ></iframe>
            </CollapsiblePanel>
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
                    v-model="selectedCueId"
                    class="input"
                    type="text"
                    placeholder="Selected Cue Id"
                />
            </div>
        </div>
        <div
            v-if="compilation.Tracks[0] && compilation.Tracks[0].Cues[0]"
            class="field"
        >
            <label class="label"
                >Description of first cue of first track ({{
                    firstCueOfFirstTrack
                }})</label
            >
            <div class="control">
                <input
                    v-model="compilation.Tracks[0].Cues[0].Description"
                    class="input"
                    type="text"
                    placeholder="Description of first cue of first track"
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

        <h2 class="subtitle has-text-danger">Message test buttons</h2>
        <div class="buttons">
            <button
                class="button is-success"
                @click="
                    {
                        message.pushProgress('Some progress');
                        message.pushProgress(
                            'Some more progress with quite a lenghty description that is also too long for the wide version of the progress text space',
                        );
                    }
                "
            >
                Set progress
            </button>
            <button class="button is-success" @click="message.popProgress()">
                Reset progress
            </button>

            <button
                class="button is-success"
                @click="
                    message.pushProgressWithPercentage(
                        new ProgressMessage(
                            'Some percentage-valued progress with a very long text and some special / slash characters to simulate a path',
                            75,
                        ),
                    );
                    message.pushProgressWithPercentage(
                        new ProgressMessage(
                            'Some other, percentage-valued progress with a very long text',
                            33,
                        ),
                    );
                "
            >
                Set progress percentage
            </button>
        </div>
    </div>

    <h3>Control knobs</h3>

    <ControlKnob id="knob1" v-model="knobValue" />
    <ControlKnob
        id="knob2"
        v-model="knobValue"
        class="button is-knob is-unselectable"
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
    /><ValueKnob v-model="knobValue" :min-value="0" :max-value="50"></ValueKnob>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import NavButton from '@/components/buttons/NavButton.vue';
//@ts-ignore (because vue-peaks does not provide types)
import ControlKnob from '@/components/controls/ControlKnob.vue';
import ValueKnob from '@/components/controls/ValueKnob.vue';
import { mdiPencil } from '@mdi/js';
import {
    rTrackPlay,
    rTrackRepeat,
    rRepeatVariant,
    rShuffleVariant,
    rTrackPlayOnce,
    rTrackRepeatOnce,
    rPlayDirect,
    rFadeInFadeOutOff,
    rFadeInFadeOutOn,
    rPlayPreplay,
    rFadeInPreRollPlay,
    rPlayFadeIn,
    rFadeInPlay,
    rPreRollPlay,
} from '@/components/icons/ReplayerIcon';
import { useAppStore } from '@/store/app';
import { storeToRefs } from 'pinia';
import CollapsiblePanel from '@/components/CollapsiblePanel.vue';
import { useMessageStore } from '@/store/messages';
import { ProgressMessage } from '@/store/messages/ProgressMessage';

const isExpanded = ref(false);
const knobValue = ref(0);

const message = useMessageStore();

const app = useAppStore();

const { compilation, selectedCueId } = storeToRefs(app);

const firstCueOfFirstTrack = computed(() => {
    return compilation.value?.Tracks[0]?.Cues[0]?.Description ?? null;
});

function writeDebug() {
    console.debug('Just a debug log with an object', { some: 'data' });
}
function writeLog() {
    console.log('Just a log');
}
function writeWarnLog() {
    console.warn('A warning');
}
function writeErrorLog() {
    console.error('Something dangerous');
}
function throwException() {
    throw 'Something bad happened!';
}
</script>
