<template>
    <div class="level is-mobile">
        <div class="level-left">
            <div class="level-item">
                <div>
                    <span class=""
                        >{{ title }}
                        <ShortcutDisplay :shortcut="shortcut"> </ShortcutDisplay
                    ></span>
                    <br />
                    <span class="has-opacity-half is-size-7">{{
                        subTitle
                    }}</span>
                </div>
            </div>
        </div>
        <div class="level-right">
            <div
                class="level-item dropdown-item-icon is-borderless has-background-transparent"
                v-if="iconName"
            >
                <BaseIcon :name="iconName" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import ShortcutDisplay from '@/components/ShortcutDisplay.vue';
/** A content for a menu item */
export default defineComponent({
    name: 'MenuItemContent',
    components: { BaseIcon, ShortcutDisplay },
    props: {
        title: {
            type: String,
            required: true,
        },

        subTitle: {
            type: String,
            default: '',
            required: false,
        },
        iconName: {
            type: String,
            default: '',
            required: false,
        },
        shortcut: {
            type: String,
            required: false,
        },
    },
});
</script>
