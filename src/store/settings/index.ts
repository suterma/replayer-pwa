import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { Store } from '..';

/** The precision for time display
 * @remarks Does not affect the application's internal precision when handling time values.
 * Only values of 1, 2 and 3 are allowed.
 */
export const TimeDisplayDecimalPlaces = 1;

/** The default precision for time handling and time calculations
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
    const addFadeInPreRoll = useLocalStorage('addFadeInPreRoll', true);

    /** The default duration for a pre-roll for play operations, in [seconds]
     * @remarks Default is zero
     */
    const defaultPreRollDuration = useLocalStorage('defaultPreRollDuration', 0);

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

    /** EXPERIMENTAL: Whether to show a menu action for sharing a track via the Track API
     * @remarks Default is false
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

    /** Whether to show the waveforms (on edit view)
     */
    const showWaveformsOnEdit = useLocalStorage('showWaveformsOnEdit', false);

    /** EXPERIMENTAL: Whether to show tempo editors/display
     * @remarks Default is false
     */
    const experimentalUseTempo = useLocalStorage('experimentalUseTempo', false);

    /** Returns the settings with their default value */
    function $reset() {
        levelMeterSizeIsLarge.value = false;
        preventScreenTimeout.value = true;
        fadeInDuration.value = 1000;
        fadeOutDuration.value = 500;
        addFadeInPreRoll.value = true;
        defaultPreRollDuration.value = 0;
        showLevelMeter.value = true;
        keyboardShortcutTimeout.value = 1000;
        timeFormat.value = TimeFormat.Iso8601Extended;
        showWaveformsOnEdit.value = false;
        experimentalShowPositionInTrackHeader.value = false;
        experimentalAllowTrackSharingByLink.value = false;
        experimentalMultitrack.value = false;
        experimentalUseTempo.value = false;
    }

    return {
        levelMeterSizeIsLarge,
        preventScreenTimeout,
        fadeInDuration,
        fadeOutDuration,
        addFadeInPreRoll,
        defaultPreRollDuration,
        showLevelMeter,
        keyboardShortcutTimeout,
        timeFormat,
        showWaveformsOnEdit,
        experimentalShowPositionInTrackHeader,
        experimentalAllowTrackSharingByLink,
        experimentalMultitrack,
        experimentalUseTempo,
        $reset,
    };
});
