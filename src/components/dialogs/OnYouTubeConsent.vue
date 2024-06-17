<template>
    <slot v-if="youTubeConsent" v-bind="$attrs"></slot>
    <template v-else>
        <div class="field" v-bind="$attrs">
            <p class="control">
                <button class="button" @click="getConsent">
                    YouTube consent...
                </button>
            </p>
        </div>
    </template>
</template>

<script setup lang="ts">
/** A "gate" component that prevents usage of the slotted (YouTube) component without consent.
 *  Uses the {YouTubeConsentDialog} to aks for consent from the user
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
