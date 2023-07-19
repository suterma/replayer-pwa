<template>
    <div class="container">
        <h1 class="title">Settings</h1>

        <div class="box">
            <h3 class="subtitle">Display</h3>

            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="preventScreenTimeout"
                        label="Prevent screen timeout when in use"
                        hint="Uses more energy"
                    ></LabeledCheckbox>
                </div>
            </div>
            <div class="field">
                <label class="label"
                    >Time format
                    <span class="has-opacity-half is-size-7">
                        (For display of duration, position and track
                        length)</span
                    >
                </label>
                <div class="control">
                    <div class="select">
                        <select v-model.number="timeFormat">
                            <!-- TimeFormat.Iso8601Extended -->
                            <option v-bind:value="1">
                                hh:mm:ss.zzz (ISO 8601 extended)
                            </option>
                            <!-- TimeFormat.DecimalSeconds -->
                            <option v-bind:value="2">
                                sss.zzz (Decimal seconds)
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="box">
            <h3 class="subtitle">Input</h3>

            <div class="field">
                <label class="label"
                    >Keyboard shortcut timeout
                    <span class="has-opacity-half is-size-7">
                        (For display and handling of playback control)</span
                    >
                </label>
                <div class="control">
                    <div class="select">
                        <select v-model.number="keyboardShortcutTimeout">
                            <option v-bind:value="500">
                                Fast (500 milliseconds)
                            </option>
                            <option v-bind:value="1000">
                                Medium (1 second)
                            </option>
                            <option v-bind:value="2000">
                                Slow (2 seconds)
                            </option>
                            <option v-bind:value="5000">
                                Molto Grave (5 seconds)
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="box">
            <h3 class="subtitle">Audio</h3>

            <!-- Default pre-roll duration -->
            <div class="columns">
                <div class="column">
                    <div class="field">
                        <label class="label"
                            >Default pre-roll duration
                            <span class="has-opacity-half is-size-7">
                                (For play operations)</span
                            >
                        </label>
                        <div class="control">
                            <div class="select">
                                <select v-model.number="defaultPreRollDuration">
                                    <option v-bind:value="0">
                                        no pre-roll
                                    </option>
                                    <option v-bind:value="0.667">
                                        0.66 seconds (1 beat @ 90 BPM)
                                    </option>
                                    <option v-bind:value="1.333">
                                        1.33 seconds (2 beats @ 90 BPM)
                                    </option>
                                    <option v-bind:value="2.0">
                                        2.00 seconds (3 beats @ 90 BPM)
                                    </option>
                                    <option v-bind:value="2.667">
                                        2.66 seconds (4 beats @ 90 BPM)
                                    </option>
                                    <option v-bind:value="4.0">
                                        4.00 seconds (6 beats @ 90 BPM)
                                    </option>
                                    <option v-bind:value="5.333">
                                        5.33 seconds (8 beats @ 90 BPM)
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Fading durations, with two columns -->
            <div class="columns">
                <div class="column">
                    <div class="field">
                        <label class="label"
                            >Fade-in duration
                            <span class="has-opacity-half is-size-7">
                                (For play operations)</span
                            >
                        </label>
                        <div class="control">
                            <div class="select">
                                <select v-model.number="fadeInDuration">
                                    <option v-bind:value="0">no fading</option>
                                    <option v-bind:value="20">
                                        20 milliseconds
                                    </option>
                                    <option v-bind:value="50">
                                        50 milliseconds
                                    </option>
                                    <option v-bind:value="100">
                                        100 milliseconds
                                    </option>
                                    <option v-bind:value="200">
                                        200 milliseconds
                                    </option>
                                    <option v-bind:value="500">
                                        500 milliseconds
                                    </option>
                                    <option v-bind:value="1000">
                                        1 seconds
                                    </option>
                                    <option v-bind:value="2000">
                                        2 seconds
                                    </option>
                                    <option v-bind:value="5000">
                                        5 seconds
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="column">
                    <div class="field">
                        <label class="label"
                            >Fade-out duration
                            <span class="has-opacity-half is-size-7">
                                (For pause operations)</span
                            >
                        </label>
                        <div class="control">
                            <div class="select">
                                <select v-model.number="fadeOutDuration">
                                    <option v-bind:value="0">no fading</option>
                                    <option v-bind:value="20">
                                        20 milliseconds
                                    </option>
                                    <option v-bind:value="50">
                                        50 milliseconds
                                    </option>
                                    <option v-bind:value="100">
                                        100 milliseconds
                                    </option>
                                    <option v-bind:value="200">
                                        200 milliseconds
                                    </option>
                                    <option v-bind:value="500">
                                        500 milliseconds
                                    </option>
                                    <option v-bind:value="1000">
                                        1 seconds
                                    </option>
                                    <option v-bind:value="2000">
                                        2 seconds
                                    </option>
                                    <option v-bind:value="5000">
                                        5 seconds
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="applyFadeInOffset"
                        label="Add fade-in to pre-roll"
                        hint="The additional pre-roll time compensates for the fade-in duration"
                    ></LabeledCheckbox>
                </div>
            </div>

            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="showLevelMeter"
                        label="Show audio level meters"
                        hint="Uses more energy, not working on older iOS
                            devices"
                    ></LabeledCheckbox>
                </div>
            </div>

            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="levelMeterSizeIsLarge"
                        label="Show large audio level meters"
                        hint="Level meters are full width"
                    ></LabeledCheckbox>
                </div>
            </div>
        </div>

        <div class="box">
            <h3 class="subtitle">Advanced</h3>
            <div class="field">
                <label class="label"
                    >Reset all data and settings
                    <span class="has-opacity-half is-size-7">
                        (Restores the initial application state)</span
                    >
                </label>
                <div class="control">
                    <button class="button" @click="reset()">Reset</button>
                </div>
            </div>
        </div>

        <!-- Experimental settings -->
        <hr />

        <div class="box is-experimental">
            <h3 class="subtitle">Experimental (Here be dragons)</h3>

            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="experimentalShowPositionInTrackHeader"
                        label="Show position in track headers"
                        hint="Uses more space"
                    ></LabeledCheckbox>
                </div>
            </div>
            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="experimentalShowWaveforms"
                        label="Show scrollable waveforms"
                        hint="Uses more more memory and CPU power"
                    ></LabeledCheckbox>
                </div>
            </div>
            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="experimentalUseTempo"
                        label="Show tempo editors / display"
                        hint="Uses more more space"
                    ></LabeledCheckbox>
                </div>
            </div>
            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="experimentalAllowTrackSharingByLink"
                        label="Show menu action to share a track by link"
                        hint="Uses the track API"
                    ></LabeledCheckbox>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';
import { confirm } from '@/code/ui/dialogs';
import { useRouter } from 'vue-router';
import LabeledCheckbox from '@/components/editor/LabeledCheckbox.vue';

/** A Settings view for the settings store
 */

const settings = useSettingsStore();

const {
    levelMeterSizeIsLarge,
    preventScreenTimeout,
    fadeInDuration,
    fadeOutDuration,
    applyFadeInOffset,
    defaultPreRollDuration,
    showLevelMeter,
    keyboardShortcutTimeout,
    timeFormat,
    experimentalShowPositionInTrackHeader,
    experimentalAllowTrackSharingByLink,
    experimentalShowWaveforms,
    experimentalUseTempo,
} = storeToRefs(settings);

const router = useRouter();

function reset() {
    console.debug('Settings::reset');
    confirm(
        'Reset',
        `Do you want to reset the application to the initial state? Already downloaded compilations remain available on the device.`,
    ).then((ok) => {
        if (ok) {
            router.push('/reset');
        }
    });
}
</script>
