<template>
    <slot v-if="youTubeConsent"></slot>
    <template v-else>
        //TODO fix dialog display Playing YouTube content requires conset to the
        YouTube TOS.
        <button @click="youTubeConsent = true">Open consent dialog</button>
    </template>
</template>

<script setup lang="ts">
/** A mandatory YouTube consent dialog, that prevents usage of the slotted (YouTube) component without consent
 */
import { consentYouTube } from '@/code/ui/dialogs';
import { onMounted } from 'vue';
import { useSettingsStore } from './../../store/settings';
import { storeToRefs } from 'pinia';

const settings = useSettingsStore();
const { youTubeConsent } = storeToRefs(settings);

onMounted(() => {
    if (!youTubeConsent.value) {
        consentYouTube().then((ok) => {
            if (ok) {
                youTubeConsent.value = true;
            }
        });
    }
});
</script>
