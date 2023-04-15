import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { StorageKeys } from './persistent-storage';

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

    /** The fading duration in [milliseconds]. Use zero for no fading.
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

    /** Whether to show experimental content
     * @remarks Default is false
     */
    const displayExperimentalContent = useLocalStorage(
        'displayExperimentalContent',
        false,
    );

    /** A timeout duration, used for the mnemonic build-up as well as the keyboard shortcut display timeout
     */
    const keyboardShortcutTimeout = ref(1000);

    /** Returns the settings with their default value */
    function setDefaults() {
        levelMeterSizeIsLarge.value = false;
        preventScreenTimeout.value = true;
        fadeInDuration.value = 1000;
        fadeOutDuration.value = 500;
        applyFadeInOffset.value = true;
        showLevelMeter.value = true;
        displayExperimentalContent.value = false;
        keyboardShortcutTimeout.value = 1000;
    }

    return {
        levelMeterSizeIsLarge,
        preventScreenTimeout,
        fadeInDuration,
        fadeOutDuration,
        applyFadeInOffset,
        showLevelMeter,
        displayExperimentalContent,
        keyboardShortcutTimeout,

        setDefaults,
    };
});
