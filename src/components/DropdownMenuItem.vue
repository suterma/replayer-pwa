<template>
    <div class="dropdown-item">
        <div class="level is-mobile is-gapless">
            <div class="level-left"></div>
            <div class="level-right">
                <span class="level-item"> {{ title }} </span>

                <span
                    class="dropdown-item-icon level-item is-borderless has-background-transparent"
                    v-if="iconName"
                >
                    <BaseIcon :name="iconName" />
                </span>
            </div>
        </div>

        <span class="has-opacity-half is-size-7"> {{ subTitle }}</span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
/** An item for a Dropdown menu
 */
export default defineComponent({
    name: 'DropdownMenuItem',
    components: { BaseIcon },
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
    },
});
</script>
