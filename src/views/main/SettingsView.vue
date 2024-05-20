<!--
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
-->
<template>
    <div>
        <h1 class="title">Settings</h1>

        <div class="box">
            <h3 class="subtitle">Display (General)</h3>

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
                            <option :value="1">
                                hh:mm:ss.zzz (ISO 8601 extended)
                            </option>
                            <!-- TimeFormat.DecimalSeconds -->
                            <option :value="2">
                                sss.zzz (Decimal seconds)
                            </option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="showPdfInline"
                        label="Offer PDF content inline (instead of link-only)"
                        hint="Inline rendering does not work on older mobile devices"
                    ></LabeledCheckbox>
                </div>
            </div>
            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="useWideContentWidth"
                        label="Use wide content width"
                        hint="Optimizes screen area usage"
                    ></LabeledCheckbox>
                </div>
            </div>
        </div>

        <div class="box">
            <h3 class="subtitle">Display (Edit)</h3>
            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="showWaveformsOnEdit"
                        label="Show scrollable waveforms (for local media only)"
                        hint="Uses more more resources"
                    ></LabeledCheckbox>
                </div>
                <div class="control ml-4">
                    <LabeledCheckbox
                        v-model="showOverviewWaveformOnEdit"
                        :disabled="!showWaveformsOnEdit"
                        label="Additionally show a waveform for the whole track (for local media only)"
                        hint="Uses more more resources"
                    ></LabeledCheckbox>
                </div>
            </div>
            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="showLevelMeterForEdit"
                        label="Show audio level meters in the edit view (for local media only)"
                        hint="Uses more resources, not working on some devices"
                    ></LabeledCheckbox>
                </div>

                <div class="control ml-4">
                    <LabeledCheckbox
                        v-model="levelMeterSizeIsLarge"
                        :disabled="!showLevelMeterForEdit"
                        label="Use large audio level meters"
                        hint="Level meters are full width"
                    ></LabeledCheckbox>
                </div>
            </div>
        </div>

        <div class="box">
            <h3 class="subtitle">Display (Play)</h3>
            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="showInitialZeroTimeCue"
                        label="Show an initial cue at the beginning of a track"
                        hint="Helps initial navigating to the start of a track"
                    ></LabeledCheckbox>
                </div>
            </div>

            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="showAddCueButtonInPlayView"
                        label="Show an add cue button (in full screen mode)"
                        hint="Allows to quickly add or remove cues during playback"
                    ></LabeledCheckbox>
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
                                    <option :value="0">no pre-roll</option>
                                    <option :value="0.667">
                                        0.66 seconds (1 beat @ 90 BPM)
                                    </option>
                                    <option :value="1.333">
                                        1.33 seconds (2 beats @ 90 BPM)
                                    </option>
                                    <option :value="2.0">
                                        2.00 seconds (3 beats @ 90 BPM)
                                    </option>
                                    <option :value="2.667">
                                        2.66 seconds (4 beats @ 90 BPM)
                                    </option>
                                    <option :value="4.0">
                                        4.00 seconds (6 beats @ 90 BPM)
                                    </option>
                                    <option :value="5.333">
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
                                    <option :value="0">no fading</option>
                                    <option :value="20">20 milliseconds</option>
                                    <option :value="50">50 milliseconds</option>
                                    <option :value="100">
                                        100 milliseconds
                                    </option>
                                    <option :value="200">
                                        200 milliseconds
                                    </option>
                                    <option :value="500">
                                        500 milliseconds
                                    </option>
                                    <option :value="1000">1 seconds</option>
                                    <option :value="2000">2 seconds</option>
                                    <option :value="5000">5 seconds</option>
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
                                    <option :value="0">no fading</option>
                                    <option :value="20">20 milliseconds</option>
                                    <option :value="50">50 milliseconds</option>
                                    <option :value="100">
                                        100 milliseconds
                                    </option>
                                    <option :value="200">
                                        200 milliseconds
                                    </option>
                                    <option :value="500">
                                        500 milliseconds
                                    </option>
                                    <option :value="1000">1 seconds</option>
                                    <option :value="2000">2 seconds</option>
                                    <option :value="5000">5 seconds</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="addFadeInPreRoll"
                        label="Add fade-in to pre-roll"
                        hint="The additional pre-roll time compensates for the fade-in duration"
                    ></LabeledCheckbox>
                </div>
            </div>
        </div>

        <div class="box">
            <h3 class="subtitle">Video</h3>
            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="youTubeConsent"
                        label="Allow connection to YouTube"
                        hint="Discloses some data to Google"
                    ></LabeledCheckbox>
                </div>
            </div>
            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="extraVideoControls"
                        label="Show extra video controls"
                        hint="Controls for video display and captions style"
                    ></LabeledCheckbox>
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
                            <option :value="500">
                                Fast (500 milliseconds)
                            </option>
                            <option :value="1000">Medium (1 second)</option>
                            <option :value="2000">Slow (2 seconds)</option>
                            <option :value="5000">
                                Molto Grave (5 seconds)
                            </option>
                        </select>
                    </div>
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
                        v-model="experimentalUseQueueCueMode"
                        label="Offer queue cue mode"
                        hint="Offers to select a cue for playback immediately after the current cue"
                    ></LabeledCheckbox>
                </div>
            </div>

            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="experimentalShowEverythingEverywhereAllAtOnce"
                        label="Show everything everywhere all at once"
                        hint="Shows all playback views simultaneously, suitable for debugging purposes"
                    ></LabeledCheckbox>
                </div>
            </div>

            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="experimentalUseMeter"
                        label="Show meter editors / display"
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
            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="experimentalMultitrack"
                        label="Show multitrack view"
                        hint="Allows to play STEM/multitrack compilations"
                    ></LabeledCheckbox>
                </div>
            </div>

            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="experimentalHideStageMark"
                        label="Hide stage mark"
                        hint="Useful for documentation purposes"
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
    showPdfInline,
    levelMeterSizeIsLarge,
    showInitialZeroTimeCue,
    showAddCueButtonInPlayView,
    preventScreenTimeout,
    useWideContentWidth,
    fadeInDuration,
    fadeOutDuration,
    addFadeInPreRoll,
    defaultPreRollDuration,
    showLevelMeterForEdit,
    keyboardShortcutTimeout,
    timeFormat,
    showWaveformsOnEdit,
    showOverviewWaveformOnEdit,
    youTubeConsent,
    extraVideoControls,
    experimentalShowEverythingEverywhereAllAtOnce,
    experimentalAllowTrackSharingByLink,
    experimentalMultitrack,
    experimentalUseQueueCueMode,
    experimentalUseMeter,
    experimentalHideStageMark,
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
