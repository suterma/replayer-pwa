<template>
    <label
        v-bind="$attrs"
        class="button is-indicator playback-indicator is-nav"
    >
        <i
            v-if="state === PlaybackState.Unavailable"
            v-tooltip="
                'Track media is unavailable. Please reload or replace it in the editor.'
            "
            class="icon mdi has-text-warning has-tooltip-warning"
            ><svg viewBox="0 0 24 24">
                <path fill="currentColor" :d="mdiAlert" />
            </svg>
        </i>
        <template v-else>
            <i
                v-if="state === PlaybackState.Unloaded"
                v-tooltip="'Track not loaded.'"
                class="icon mdi has-text-dark"
                ><svg viewBox="0 0 24 24">
                    <path fill="currentColor" :d="mdiCircle" />
                </svg>
            </i>

            <template v-else>
                <i style="position: relative" class="icon mdi"
                    ><svg viewBox="0 0 24 24" class="has-text-grey">
                        <path fill="currentColor" :d="mdiCircle" />
                    </svg>
                    <svg
                        viewBox="0 0 24 24"
                        style="position: absolute; left: 0"
                        class="has-text-success"
                        :class="{
                            'has-transition': state === PlaybackState.Playing,
                            'is-transparent': isPausing,
                        }"
                    >
                        <path fill="currentColor" :d="mdiCircle" />
                    </svg>
                </i>
            </template>
        </template>
    </label>
</template>
<script setup lang="ts">
/** An indicator for the playback state of a track
 * @devdoc For rendering optimization for the two most switched states,
 * ready and playing, the transition is updating only opacity, when
 * switching between these two states. Other states are implemented separately
 * and are not optimized.
 * NOTE: For performance reasons, the icon is implemented inline, not using the BaseIcon SFC -->
 */
import { mdiAlert, mdiCircle } from '@mdi/js';
import { computed, ref, watch, type PropType } from 'vue';
import { PlaybackState } from '@/code/media/PlaybackState';
import { FadingMode } from '@/code/media/IAudioFader';

const props = defineProps({
    /** The state the indicator should convey */
    state: {
        type: null as unknown as PropType<PlaybackState>,
        default: PlaybackState.Unavailable,
        required: false,
    },

    /** The current fading action, or none if not fading, plus the  */
    fadingAction: {
        type: null as unknown as PropType<FadingMode>,
        default: FadingMode.None,
        required: false,
    },

    /** The current fade-in duration, or zero if none */
    fadeInDuration: Number,

    /** The current fade-out duration, or zero if none */
    fadeOutDuration: Number,

    /** Whether the media player will omit the next fade-in */
    isOmittingNextFadeIn: Boolean,
});

/** The currently appliccable transition duration value, formatted in milliseconds.
 * @remarks By default, start with the fade-in
 */
const transitionDurationValue = ref(`${props.fadeInDuration}ms`);

/** Whether the playback is currently not playing, or is playing but fading out. */
const isPausing = computed((): boolean => {
    if (props.state !== PlaybackState.Playing) {
        return true;
    }
    if (props.fadingAction === FadingMode.FadeOut) {
        return true;
    }
    return false;
});

/** A keeper as whether the next fade-in will be omitted */
const isOmittingNext = ref(false);

/** Handles the omission of fade-ins
 */
watch([() => props.isOmittingNextFadeIn], ([isOmitting]) => {
    isOmittingNext.value = isOmitting;
    if (isOmitting) {
        // prepare for the next, instant, transition
        transitionDurationValue.value = '0s';
    }
});

/** Handles the running fade-out, or the fade-in
 */
watch(
    [
        () => isPausing.value,
        () => props.state,
        () => props.fadeOutDuration,
        () => props.fadeInDuration,
    ],
    ([pausing, state, fadeOut, fadeIn]) => {
        if (pausing) {
            transitionDurationValue.value = `${fadeOut ?? 0}ms`;
        } else {
            if (
                fadeIn &&
                state === PlaybackState.Playing &&
                !isOmittingNext.value
            ) {
                // a regular fade-in
                transitionDurationValue.value = `${fadeIn ?? 0}ms`;
            }
        }
    },
);
</script>
<style>
/** Handling visibilty via opacity for rendering performance,
 * avoiding non-composited animations. 
 */
label.is-indicator.playback-indicator i svg.has-transition {
    transition: opacity v-bind('transitionDurationValue') linear;
}
label.is-indicator.playback-indicator i svg.is-transparent {
    opacity: 0;
}
</style>
