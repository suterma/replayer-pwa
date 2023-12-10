<template>
    <ModalDialog informational cancelButtonText="Dismiss" wide>
        <template #title>Sharing track '{{ track?.Descriptor }}'</template>
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
import type { ICue, Track } from '@/store/compilation-types';
import { type PropType, computed } from 'vue';
import { useRouter, type RouteLocationRaw } from 'vue-router';
import ModalDialog from '@/components/dialogs/ModalDialog.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiLink, mdiEmailOutline } from '@mdi/js';
import { useMessageStore } from '@/store/messages';
import { useClipboard } from '@vueuse/core';

const props = defineProps({
    track: {
        type: Object as PropType<Track>,
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

/** Gets the timestamp of a cue as an object key
 * @devdoc Makes sure the numeric keys are not integers, to keep a more suitable order
 * later on when creating the API query parameters
 * Javascript unfortunately orders integer object keys as first
 */
function getCueObjectKey(value: ICue): string {
    if (!value.Time) {
        return '0.0';
    }
    return value.Time.toString();
}

const router = useRouter();

const trackUrl = computed(() => {
    //Prepare track metadata
    let apiQuery = {
        media: props.track?.Url,
        title: props.track?.Name,
        album: props.track?.Album,
        artist: props.track?.Artist,
    };

    //Add available cues
    const cues = props.track?.Cues;
    if (cues) {
        apiQuery = Object.assign(
            apiQuery,
            ...cues.map((cue) => ({
                [getCueObjectKey(cue)]: cue.Description,
            })),
        );
    }
    console.debug('TrackSharingDialog::trackUrl:apiQuery:', apiQuery);

    //Build the URL
    const route = {
        name: 'Play',
        query: apiQuery,
    } as unknown as RouteLocationRaw;
    return (
        window.location.protocol +
        '//' +
        window.location.host +
        window.location.pathname +
        router.resolve(route).href
    );
});

// --- Sharing ---

/** Copies the Replayer link to the clipboard
 */
const { copy } = useClipboard();
function copyLink(): void {
    copy(trackUrl.value);
    message.pushSuccess('Link copied to clipboard!');
}

/** Emails the Replayer link via a registered mail client
 */
function emailLink(): void {
    window.open(
        `mailto:?subject=Replayer link to ${props.track?.Descriptor}&body=${trackUrl.value}`,
        '_blank',
    );
    message.pushSuccess('Link opened as email!');
}
</script>
