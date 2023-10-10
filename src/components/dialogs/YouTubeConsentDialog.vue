<template>
    <ModalDialog submitButtonText="Accept">
        <template #title>Connecting to YouTube...</template>
        <template #body>
            <p>
                You are about to load content from YouTube, a service from
                Google.
            </p>
            <p>By doing so, your browser discloses some data.</p>
            <p>
                The
                <a
                    href="https://www.youtube.com/t/terms"
                    alt="Link to the YouTube Terms of Service"
                    target="_blank"
                    >YouTube Terms of Service</a
                >
                and
                <a
                    href="https://policies.google.com/privacy"
                    alt="Link to Google's privacy policy"
                    target="_blank"
                    >Google's Privacy Policy</a
                >
                apply.
            </p>
            <p>
                You can change your decision later on the
                <router-link to="settings">Settings</router-link> page.
            </p>
        </template>
    </ModalDialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import ModalDialog from '@/components/dialogs/ModalDialog.vue';

export default defineComponent({
    name: 'YouTubeConsentDialog',
    components: { ModalDialog },
    setup() {
        /** NOTE: Returning the returnValue function is required by vue3-promise-dialog */
        function returnValue() {
            return true;
        }
        return {
            returnValue,
        };
    },
});
</script>
