<template>
    <span class="icon">
        <i class="mdi mdi-24px">
            <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
                <path fill="currentColor" :d="path" />
            </svg>
        </i>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mdiHeart } from '@mdi/js';

export var rTrackPlay = 'm 7,17 h 10 v -3 l 4,4 -4,4 V 19 H 5 v -6 h 2';
export var rTrackRepeat =
    'M 17,17 H 7 v -3 l -4,4 4,4 V 19 H 19 V 13 H 17 M 7,7 h 10 v 3 L 21,6 17,2 V 5 H 5 v 6 h 2 z';
export var rTrackPlayOnce =
    'm 7,17 h 10 v -3 l 4,4 -4,4 V 19 H 5 v -6 h 2 m 7,2 V 9 h -1 l -2,1 v 1 h 1.5 v 4';
export var rTrackRepeatOnce =
    'M13,15V9H12L10,10V11H11.5V15M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z';
export var rRepeatVariant =
    'M6,5.75L10.25,10H7V16H13.5L15.5,18H7A2,2 0 0,1 5,16V10H1.75L6,5.75M18,18.25L13.75,14H17V8H10.5L8.5,6H17A2,2 0 0,1 19,8V14H22.25L18,18.25Z';
export var rShuffleVariant =
    'M17,3L22.25,7.5L17,12L22.25,16.5L17,21V18H14.26L11.44,15.18L13.56,13.06L15.5,15H17V12L17,9H15.5L6.5,18H2V15H5.26L14.26,6H17V3M2,6H6.5L9.32,8.82L7.2,10.94L5.26,9H2V6Z';

/** A basic icon, using a path
 * @remarks This component provides icons based on a path, intended to be taken from @mdi/js
 * (material design icon set, see credits in the about page)
 */
export default defineComponent({
    name: 'BaseIcon',
    props: {
        /** The icon path, according to @mdi/js */
        path: {
            type: String,
            default: mdiHeart,
        },
    },
});
</script>
