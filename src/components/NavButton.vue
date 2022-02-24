<template>
    <button class="button is-nav" :title="title" tabindex="0">
        <Icon :name="this.iconName" />
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Icon from '@/components/icons/Icon.vue';

/** A button for navigational purposes, featuring an optional  icon
 * @remarks This button is intended for non-actional buttons like menu togglers, edit togglers etc.
 * These are buttons that do not effectively change the data, but serve a more navigational purpose.
 * The are styled distinctively, without border and just a slight hover indication.
 */
export default defineComponent({
    name: 'NavButton',
    components: { Icon },
    props: {
        /** The text for a tooltip */
        title: {
            type: String,
            default: '',
        },

        /** The icon name, if any */
        iconName: {
            type: String,
            default: '',
        },
    },
    methods: {},
});
</script>
