import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { StorageKeys } from '..';

/** The precision for time display
 * @remarks Does not affect the application's internal precision when handling time values.
 * Only values of 1, 2 and 3 are allowed.
 */
export const TimeDisplayDecimalPlaces = 1;

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
export const useSettingsStore = defineStore(StorageKeys.SETTINGS, () => {
    /** Whether the audio level meter size is large */
    const levelMeterSizeIsLarge = useLocalStorage(
        'levelMeterSizeIsLarge',
        false,
    );

    /** Whether to always keep the screen lit while a track is in use
     * @remarks Default is false
     */
    const preventScreenTimeout = useLocalStorage('preventScreenTimeout', true);

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
    const applyFadeInOffset = useLocalStorage('applyFadeInOffset', true);

    /** Whether to show the audio level meter
     * @remarks Default is true
     */
    const showLevelMeter = useLocalStorage('showLevelMeter', true);

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

    /** EXPERIMENTAL: Whether to show the track position in the header
     * @remarks Default is false
     */
    const experimentalShowPositionInTrackHeader = useLocalStorage(
        'experimentalShowPositionInTrackHeader',
        false,
    );

    /** EXPERIMENTAL: Whether to show the waveforms
     * @remarks Default is false
     */
    const experimentalShowWaveforms = useLocalStorage(
        'experimentalShowWaveforms',
        false,
    );

    /** Returns the settings with their default value */
    function $reset() {
        levelMeterSizeIsLarge.value = false;
        preventScreenTimeout.value = true;
        fadeInDuration.value = 1000;
        fadeOutDuration.value = 500;
        applyFadeInOffset.value = true;
        showLevelMeter.value = true;
        keyboardShortcutTimeout.value = 1000;
        timeFormat.value = TimeFormat.Iso8601Extended;
        experimentalShowPositionInTrackHeader.value = false;
        experimentalShowWaveforms.value = false;
    }

    return {
        levelMeterSizeIsLarge,
        preventScreenTimeout,
        fadeInDuration,
        fadeOutDuration,
        applyFadeInOffset,
        showLevelMeter,
        keyboardShortcutTimeout,
        timeFormat,
        experimentalShowPositionInTrackHeader,
        experimentalShowWaveforms,
        $reset,
    };
});