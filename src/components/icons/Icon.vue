<template>
    <span class="icon">
        <i class="mdi mdi-24px">
            <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
                <path fill="currentColor" :d="getPath()" />
            </svg>
        </i>
    </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export enum IconName {
    Heart = 'heart',
    ChevronDown = 'chevron-down',
    Indicator = 'indicator',
    Play = 'play',
    SkiptNext = 'skip-next',
    Trash = 'trash',
}

/** An icon
 * @devdoc See https://github.com/ismail9k/use-svg
 */
export default defineComponent({
    name: 'Icon',
    props: {
        /** The icon name, according to icons.json */
        name: {
            type: String as PropType<IconName>,
            default: IconName.Heart,
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
            };

            const icon = (str: IconName) => ICON_MAP[str] || str;
            return icon(this.name);
        },
    },
});
</script>
