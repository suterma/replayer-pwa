<template>
    <div v-if="displayExperimentalContent" class="is-experimental">
        <slot> </slot>
    </div>
</template>
<script lang="ts">
import { useSettingsStore } from '@/store/settings';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';

/** A wrapper around experimental content, which is only rendered, when the 'displayExperimentalContent' setting is set to true
 * @devdoc the v-if directive is used, completely omitting experimental content, if not displayed.
 */
export default defineComponent({
    name: 'Experimental',

    computed: {
        /** Whether to display experimental content */

        ...mapState(useSettingsStore, ['displayExperimentalContent']),
    },
});
</script>
