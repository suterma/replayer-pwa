<template>
    <a href="#" class="dropdown-item">
        {{ title }}<br />
        <span class="has-opacity-half is-size-7"> {{ subTitle }}</span>
    </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
/** An item for a Dropdown menu
 */
export default defineComponent({
    name: 'DropdownMenuItem',
    components: {},
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
    },
});
</script>
