/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { Store } from '..';
import { ref } from 'vue';

/** The precision for time display
 * @remarks Does not affect the application's internal precision when handling time values.
 * Only values of 1, 2 and 3 are allowed.
 */
export const TimeDisplayDecimalPlaces = 1;

/** The default precision, as absolute value, for time handling and time calculations
 */
export const DefaultMathPrecisionAbsolute = 0.001;

/** The default precision, in digits after the decimal point, for time handling and time calculations
 * @remarks Prevents the use of overly lengthy number values, which are not relevant for music playback.
 */
export const DefaultMathPrecision = 3;

/** Variants of time representation */
export enum TimeFormat {
    /** Represents time in the IS0 8601 extended format
     * @remarks See https://en.wikipedia.org/wiki/ISO_8601#Times
     */
    Iso8601Extended = 1,
    /** Represents time as decimal value of seconds
     */
    DecimalSeconds = 2,
}

/** A store for application settings */
export const useSettingsStore = defineStore(Store.Settings, () => {
    /** Whether to render PDF files inline, instead of just showing a link */
    const showPdfInline = useLocalStorage('showPdfInline', true);

    /** Whether the audio level meter size is large */
    const levelMeterSizeIsLarge = useLocalStorage(
        'levelMeterSizeIsLarge',
        false,
    );

    /** Whether to show an initial cue at the beginning of a track  */
    const showInitialZeroTimeCue = useLocalStorage(
        'showInitialZeroTimeCue',
        false,
    );

    /** Whether to show an add cue button in the play view (in full screen mode)  */
    const showAddCueButtonInPlayView = useLocalStorage(
        'showAddCueButtonInPlayView',
        true,
    );

    /** Whether to always keep the screen lit while a track is in use
     * @remarks Default is true
     */
    const preventScreenTimeout = useLocalStorage('preventScreenTimeout', true);

    /** Whether to use a wide content width
     * @remarks Default is false
     */
    const useWideContentWidth = useLocalStorage('useWideContentWidth', false);

    /** The fade-in duration in [milliseconds]. Use zero for no fading.
     * @remarks Default is 1000
     */
    const fadeInDuration = useLocalStorage('fadeInDuration', 1000);

    /** The fade-out duration in [milliseconds]. Use zero for no fading.
     * @remarks Default is 500.
     */
    const fadeOutDuration = useLocalStorage('fadeOutDuration', 500);

    /** Whether to apply an offset for fade-in operations, to compensate for the fading duration
     * @remarks Default is true
     */
    const addFadeInPreRoll = useLocalStorage('addFadeInPreRoll', true);

    /** The default duration for a pre-roll for play operations, in [seconds]
     * @remarks Default is zero
     */
    const defaultPreRollDuration = useLocalStorage('defaultPreRollDuration', 0);

    /** Whether to show the audio level meter
     * @remarks Default is false
     */
    const showLevelMeterForEdit = useLocalStorage(
        'showLevelMeterForEdit',
        false,
    );

    /** A timeout duration, used for the mnemonic build-up as well as the keyboard shortcut display timeout
     */
    const keyboardShortcutTimeout = useLocalStorage(
        'keyboardShortcutTimeout',
        1000,
    );

    /** The time format to use for display
     * @remarks Default is true
     */
    const timeFormat = useLocalStorage(
        'timeFormat',
        TimeFormat.Iso8601Extended,
    );

    /** EXPERIMENTAL: Whether to show all playback views simultaneously
     * @remarks Default is false
     */
    const experimentalShowEverythingEverywhereAllAtOnce = useLocalStorage(
        'experimentalShowEverythingEverywhereAllAtOnce',
        false,
    );

    /** EXPERIMENTAL: Whether to show a menu action for sharing a track via the Track API
     */
    const experimentalAllowTrackSharingByLink = useLocalStorage(
        'experimentalAllowTrackSharingByLink',
        false,
    );

    /** EXPERIMENTAL: Whether to show a menu for the multitrack view
     * @remarks Default is false
     */
    const experimentalMultitrack = useLocalStorage(
        'experimentalMultitrack',
        false,
    );

    /** EXPERIMENTAL: Whether to show a menu for pitch shift
     * @remarks Default is false
     */
    const experimentalPitchShift = useLocalStorage(
        'experimentalPitchShift',
        false,
    );

    /** EXPERIMENTAL: Whether to use the queue cue mode
     * @remarks Default is false
     */
    const experimentalUseQueueCueMode = useLocalStorage(
        'experimentalUseQueueCueMode',
        false,
    );

    /** Whether to show the waveforms (on edit view)
     */
    const showWaveformsOnEdit = useLocalStorage('showWaveformsOnEdit', true);

    /** Whether to show the overview waveform (on edit view)
     */
    const showOverviewWaveformOnEdit = useLocalStorage(
        'showOverviewWaveformOnEdit',
        false,
    );

    /** Whether to use fading on loop boundaries (false by default)
     */
    const useFadingOnLoopBoundaries = useLocalStorage(
        'useFadingOnLoopBoundaries',
        false,
    );

    /** Whether to consent to loading YouTube resources has been given
     */
    const youTubeConsent = useLocalStorage('youTubeConsent', false);

    /** Whether to show extra video controls
     */
    const extraVideoControls = useLocalStorage('extraVideoControls', false);

    /** EXPERIMENTAL: Whether to show meter editors/display
     * @remarks Default is false
     */
    const experimentalUseMeter = useLocalStorage('experimentalUseMeter', false);

    /** EXPERIMENTAL: Whether to hide the stage mark
     * @remarks This is not persisted to keep the user still informed after any restart
     */
    const experimentalHideStageMark = ref(false);

    /** EXPERIMENTAL: Whether to load and show mobile dev tools
     */
    const experimentalUseMobileDevTools = useLocalStorage(
        'experimentalUseMobileDevTools',
        false,
    );

    /** EXPERIMENTAL: Whether to show the remarks editors
     */
    const experimentalShowRemarksEditors = useLocalStorage(
        'experimentalShowRemarksEditors',
        false,
    );

    /** Returns the settings to their default value */
    function $reset() {
        showPdfInline.value = true;
        levelMeterSizeIsLarge.value = false;
        showInitialZeroTimeCue.value = false;
        showAddCueButtonInPlayView.value = true;
        preventScreenTimeout.value = true;
        useWideContentWidth.value = false;
        fadeInDuration.value = 1000;
        fadeOutDuration.value = 500;
        addFadeInPreRoll.value = true;
        defaultPreRollDuration.value = 0;
        showLevelMeterForEdit.value = false;
        keyboardShortcutTimeout.value = 1000;
        timeFormat.value = TimeFormat.Iso8601Extended;
        showWaveformsOnEdit.value = true;
        showOverviewWaveformOnEdit.value = false;
        useFadingOnLoopBoundaries.value = false;
        youTubeConsent.value = false;
        extraVideoControls.value = false;
        experimentalShowEverythingEverywhereAllAtOnce.value = false;
        experimentalAllowTrackSharingByLink.value = false;
        experimentalMultitrack.value = false;
        experimentalPitchShift.value = false;
        experimentalUseQueueCueMode.value = false;
        experimentalUseMeter.value = false;
        experimentalHideStageMark.value = false;
        experimentalUseMobileDevTools.value = false;
        experimentalShowRemarksEditors.value = false;
    }

    return {
        showPdfInline,
        levelMeterSizeIsLarge,
        showInitialZeroTimeCue,
        showAddCueButtonInPlayView,
        preventScreenTimeout,
        useWideContentWidth,
        fadeInDuration,
        fadeOutDuration,
        addFadeInPreRoll,
        /** The default duration for a pre-roll for play operations, in [seconds]
         */
        defaultPreRollDuration,
        showLevelMeterForEdit,
        keyboardShortcutTimeout,
        timeFormat,
        showWaveformsOnEdit,
        showOverviewWaveformOnEdit,
        useFadingOnLoopBoundaries,
        youTubeConsent,
        extraVideoControls,
        experimentalShowEverythingEverywhereAllAtOnce,
        experimentalAllowTrackSharingByLink,
        experimentalMultitrack,
        experimentalPitchShift,
        experimentalUseQueueCueMode,
        experimentalUseMeter,
        experimentalHideStageMark,
        experimentalUseMobileDevTools,
        experimentalShowRemarksEditors,
        $reset,
    };
});
