<template>
    <ModalDialog informational cancelButtonText="Dismiss" wide>
        <template #title
            >Sharing track '{{ TrackApi.Descriptor(props.track) }}'</template
        >
        <template #body>
            <div class="block">
                <div class="level">
                    <div class="level-item has-text-centered">
                        <div>
                            <p
                                class="control"
                                title="Copy the Replayer link into the clipboard"
                            >
                                <button
                                    class="button is-clickable is-success"
                                    @click="copyLink()"
                                >
                                    <BaseIcon v-once :path="mdiLink" />
                                </button>
                            </p>
                            <p class="heading">Copy link</p>
                        </div>
                    </div>
                    <div class="level-item has-text-centered">
                        <div>
                            <p
                                class="control"
                                title="Open the Replayer link in your email software"
                            >
                                <button
                                    class="button is-clickable is-success"
                                    @click="emailLink()"
                                >
                                    <BaseIcon v-once :path="mdiEmailOutline" />
                                </button>
                            </p>
                            <p class="heading">E-mail link</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="block">
                <p>
                    You are sharing the track metadata and the URL, not the
                    media file itself.
                </p>
            </div>
        </template>
    </ModalDialog>
</template>

<script setup lang="ts">
/**
 * A dialog for sharing a track API URL.
 * @remarks This dialog is used only when the Web Share API is not available or not
 * capable of sharing an URL
 */
import { type PropType, computed } from 'vue';
import { useRouter, type RouteLocationRaw } from 'vue-router';
import ModalDialog from '@/components/dialogs/ModalDialog.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { TrackApi } from '@/code/api/TrackApi';
import { mdiLink, mdiEmailOutline } from '@mdi/js';
import { useMessageStore } from '@/store/messages';
import { useClipboard } from '@vueuse/core';
import type { ICue } from '@/store/ICue';
import type { ITrack } from '@/store/ITrack';

const props = defineProps({
    track: {
        type: Object as PropType<ITrack>,
    },
});

const message = useMessageStore();

// --- Dialog handling ---

/** Define the return function according to https://github.com/rlemaigre/vue3-promise-dialog#usage-with-script-setup */
defineExpose({
    returnValue: () => {
        return true;
    },
});

const trackApiUrl = computed(() => {
    return TrackApi.Url(props.track);
});

// --- Sharing ---

/** Copies the Replayer link to the clipboard
 */
const { copy } = useClipboard();
function copyLink(): void {
    copy(trackApiUrl.value);
    message.pushSuccess('Link copied to clipboard!');
}

/** Emails the Replayer link via a registered mail client
 */
function emailLink(): void {
    window.open(
        `mailto:?subject=Replayer link to: ${TrackApi.Descriptor(
            props.track,
        )}&body=${trackApiUrl.value}`,
        '_blank',
    );
    message.pushSuccess('Link opened as email!');
}
</script>
