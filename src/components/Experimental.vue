<template>
    <div v-if="isExperimental" class="is-experimental">
        <slot> </slot>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { settingsMixin } from '@/mixins/settingsMixin';

/** A wrapper around experiemntal content, which is only rendered, when the 'displayExperimentalContent' setting is set to true
 * @devdoc the v-if directive is used, completely omitting experimental content, if not displayed.
 */
export default defineComponent({
    name: 'Experimental',
    mixins: [settingsMixin],

    computed: {
        /** Whether to display experimental content */
        isExperimental(): boolean {
            return this.getSettings.displayExperimentalContent;
        },
    },
});
</script>
