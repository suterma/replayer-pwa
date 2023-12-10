<template>
    <ModalDialog submitButtonText="Done" wide>
        <template #title>Share track '{{ track?.Name }}' via...</template>
        <template #body>
            <div class="block">
                <p>
                    You are sharing the track metadata and the URL, not the
                    media file itself.
                </p>
            </div>
            <!-- <p
                class="has-cropped-text"
                title="A clickable link for using this track with Replayer"
            >
                <a :href="trackUrl" target="_blank">
                    <span>{{ trackUrl }} </span>
                </a>
            </p> -->
            <!-- //Sharing icons -->
            <div class="block">
                <div class="level">
                    <div class="level-item has-text-centered">
                        <div>
                            <p
                                class="control"
                                title="Copy the link to this track (for use in Replayer)"
                            >
                                <button
                                    class="button is-clickable"
                                    :disabled="!isSupported"
                                    @click="startShare"
                                >
                                    {{
                                        isSupported
                                            ? 'Share'
                                            : 'Web share is not supported in your browser'
                                    }}
                                </button>
                            </p>
                            <p class="heading">Copy link</p>
                        </div>
                    </div>
                    <div class="level-item has-text-centered">
                        <div>
                            <p
                                class="control"
                                title="Copy the link to this track (for use in Replayer)"
                            >
                                <button
                                    class="button is-clickable"
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
                                title="Copy the link to this track (for use in Replayer)"
                            >
                                <button
                                    class="button is-clickable"
                                    @click="mailLink()"
                                >
                                    <BaseIcon v-once :path="mdiLink" />
                                </button>
                            </p>
                            <p class="heading">E-mail link</p>
                        </div>
                    </div>
                    <div class="level-item has-text-centered">
                        <div>
                            <p
                                class="control"
                                title="Share using your registered apps..."
                            >
                                <button
                                    class="button is-clickable"
                                    @click="startShare()"
                                >
                                    <BaseIcon v-once :path="mdiLink" />
                                </button>
                            </p>
                            <p class="heading">Via app...</p>
                        </div>
                    </div>
                    <div class="level-item has-text-centered">
                        <div>
                            <p class="title">3,456</p>
                            <p class="heading">Copy link</p>
                        </div>
                    </div>
                    <div class="level-item has-text-centered">
                        <div>
                            <p class="heading">Following</p>
                            <p class="title">123</p>
                        </div>
                    </div>
                    <div class="level-item has-text-centered">
                        <div>
                            <p class="heading">Followers</p>
                            <p class="title">456K</p>
                        </div>
                    </div>
                    <div class="level-item has-text-centered">
                        <div>
                            <p class="heading">Likes</p>
                            <p class="title">789</p>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </ModalDialog>
</template>

<script setup lang="ts">
import type { ICue, Track } from '@/store/compilation-types';
import { type PropType, computed, ref } from 'vue';
import { useRouter, type RouteLocationRaw } from 'vue-router';
import ModalDialog from '@/components/dialogs/ModalDialog.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiLink } from '@mdi/js';
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
    message.pushSuccess('Link copied!');
}

/** System-supported sharing */

import { isClient } from '@vueuse/shared';
import { useShare } from '@vueuse/core';

const options = ref({
    title: 'Replayer link',
    text: props.track?.Name,
    url: isClient ? trackUrl.value : '',
});

const { share, isSupported } = useShare(options);

function startShare() {
    return share().catch((err) => err);
}
</script>
