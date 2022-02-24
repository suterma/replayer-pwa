<template>
    <span class="icon">
        <i class="mdi mdi-24px">
            <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
                <path
                    v-if="this.getPath()"
                    fill="currentColor"
                    :d="getPath()"
                />
            </svg>
        </i>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/** An icon
 * @remarks This component provides a finite set of icons to the replayer app
 * @remarks All icons are taken from the material design icon set (see credits in the about page)
 * @devdoc For how to internally provice svg icons, see https://github.com/ismail9k/use-svg
 */
export default defineComponent({
    name: 'Icon',
    props: {
        /** The icon name, according to icons.json */
        name: {
            type: String,
            default: 'heart',
        },
    },
    methods: {
        getPath(): string {
            interface Map {
                [key: string]: string | undefined;
            }

            const ICON_MAP: Map = {
                heart: 'M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z',
                'chevron-down':
                    'M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z',
                indicator:
                    'M19,12C19,15.86 15.86,19 12,19C8.14,19 5,15.86 5,12C5,8.14 8.14,5 12,5C15.86,5 19,8.14 19,12Z',
                play: 'M8,5.14V19.14L19,12.14L8,5.14Z',
                'skip-next': 'M16,18H18V6H16M6,18L14.5,12L6,6V18Z',
                trash: 'M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z',
                empty: '',
                world: 'M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z',
                'chevron-right':
                    'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z',
                'chevron-left':
                    'M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z',

                'loop-none': 'm 7,17 h 10 v -3 l 4,4 -4,4 V 19 H 5 v -6 h 2',
                'loop-track':
                    'M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z',
                volume: 'M 18,18 H 6 C 18,6 6,18 18,6 Z',
                unmuted: 'M7,9V15H11L16,20V4L11,9H7Z',
                muted: 'M5.64,3.64L21.36,19.36L19.95,20.78L16,16.83V20L11,15H7V9H8.17L4.22,5.05L5.64,3.64M16,4V11.17L12.41,7.58L16,4Z',
                download: 'M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z',
                pause: 'M14,19H18V5H14M6,19H10V5H6V19Z',
                stop: 'M18,18H6V6H18V18Z',
                plus: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z',
            };

            const icon = (name: string) => ICON_MAP[name] || '';
            return icon(this.name);
        },
    },
});
</script>
