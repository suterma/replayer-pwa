<template>
    <slot v-if="youTubeConsent"></slot>
    <template v-else>
        <div class="field">
            <p class="control">
                <button class="button" @click="getConsent">
                    YouTube consent...
                </button>
            </p>
        </div>
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
        getConsent();
    }
});

function getConsent() {
    consentYouTube().then((ok) => {
        if (ok) {
            youTubeConsent.value = true;
        }
    });
}
</script>
