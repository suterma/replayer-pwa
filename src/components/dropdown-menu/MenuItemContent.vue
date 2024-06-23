<template>
    <div class="level is-mobile" :title="subTitle">
        <div class="level-left">
            <div
                v-if="iconPath"
                class="level-item dropdown-item-icon is-borderless has-background-transparent pl-0 pr-0"
            >
                <!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC -->
                <i class="icon mdi">
                    <svg viewBox="0 0 24 24">
                        <path fill="currentColor" :d="iconPath" />
                    </svg>
                </i>
            </div>
            <div class="level-item">
                <div>
                    <span class="">{{ title }}</span>
                    <slot></slot>
                </div>
            </div>
        </div>
        <div class="level-right">
            <div class="level-item">
                <slot name="right-item"></slot>
                <ShortcutDisplay v-if="slots.shortcut"
                    ><slot name="shortcut"></slot
                ></ShortcutDisplay>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ShortcutDisplay from '@/components/ShortcutDisplay.vue';
/** A content for a menu item */

defineProps({
    title: {
        type: String,
        required: true,
    },
    subTitle: {
        type: String,
        default: '',
        required: false,
    },
    iconPath: {
        type: String,
        default: '',
        required: false,
    },
});

import { useSlots } from 'vue';
const slots = useSlots();
</script>
