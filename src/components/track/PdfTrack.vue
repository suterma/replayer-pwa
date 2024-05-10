<template>
    <div
        class="track is-together-print is-inactive-track is-pdf block"
        data-cy="track-pdf"
        :class="{
            'is-editable': isTrackEditable,
        }"
    >
        <FullscreenPanel
            v-slot="{
                isFullscreen,
                hasNative: hasNativeFullscreenSupport,
                toggle,
            }"
        >
            <div v-if="!isFullscreen" class="block">
                <!-- Each track is an item in a list -->
                <div
                    class="track-header level is-mobile is-align-items-flex-start"
                >
                    <!-- Left side -->
                    <div
                        class="level-left level-wrap is-justify-content-flex-start"
                    >
                        <template v-if="!isFullscreen && isTrackPlayable">
                            <div class="level-item is-narrow">
                                <!-- Offer the native full screen, if available -->
                                <FullscreenToggler
                                    v-if="hasNativeFullscreenSupport"
                                    :disabled="!Boolean(mediaUrl)"
                                    :model-value="isFullscreen"
                                    title="Toggle full-screen mode"
                                    @click="toggle"
                                ></FullscreenToggler>
                                <CollapsibleButton
                                    v-else
                                    :disabled="!Boolean(mediaUrl)"
                                    :model-value="isFullscreen"
                                    title="Toggle full-page mode"
                                    collapsed-chevron-direction="up"
                                    @click="toggle"
                                ></CollapsibleButton>
                            </div>
                            <!-- Always offer the expander -->
                            <div class="level-item is-narrow">
                                <CollapsibleButton
                                    class="is-nav"
                                    :model-value="isExpanded"
                                    title="PDF"
                                    collapsed-text="Click to expand / show PDF"
                                    expanded-text="Click to collapse"
                                    @update:model-value="
                                        isExpanded = !isExpanded
                                    "
                                >
                                </CollapsibleButton>

                                <!-- Title --><!-- The title is the only header element that should shrink (break on words) if necessary -->
                                <div
                                    class="is-flex-shrink-1 ml-3"
                                    :class="{
                                        'is-clickable': Boolean(mediaUrl),
                                        'has-cursor-not-allowed':
                                            !Boolean(mediaUrl),
                                    }"
                                    @click="isExpanded = !isExpanded"
                                >
                                    <p class="title is-4" :title="track.Url">
                                        <BaseIcon
                                            v-once
                                            class="mr-2"
                                            :path="mdiFilePdfBox"
                                        />
                                        <TrackTitleName :name="track.Name">
                                        </TrackTitleName>
                                    </p>
                                </div>
                            </div>
                        </template>
                        <!-- Non-Native PDF support, just show a link -->
                        <!-- //TODO later use pdfjs, if available -->
                        <template v-else>
                            <div
                                class="is-flex-shrink-1 ml-3"
                                :class="{
                                    'is-clickable': Boolean(mediaUrl),
                                    'has-cursor-not-allowed':
                                        !Boolean(mediaUrl),
                                }"
                            >
                                <p :title="track.Url">
                                    <BaseIcon
                                        v-once
                                        class="mr-2"
                                        :path="mdiFilePdfBox"
                                    />
                                    <a :href="mediaUrl" target="_blank">
                                        {{ track.Name }}
                                    </a>
                                </p>
                            </div>
                        </template>

                        <!-- Edit -->
                        <template v-if="isTrackEditable">
                            <div class="level-item is-narrow">
                                <CollapsibleButton
                                    class="is-nav"
                                    :model-value="isExpanded"
                                    title="PDF"
                                    collapsed-text="Click to expand / show PDF"
                                    expanded-text="Click to collapse"
                                    @update:model-value="
                                        isExpanded = !isExpanded
                                    "
                                >
                                </CollapsibleButton>
                            </div>
                            <div class="level-item is-narrow">
                                <!-- The edit title and file part -->
                                <CoveredPanel
                                    ref="mediaDropZonePanel"
                                    :icon-path="mdiSwapVertical"
                                    class="level-item"
                                >
                                    <template #caption>
                                        <MediaSourceIndicator
                                            :source="track.Url"
                                            :unavailable="!mediaUrl"
                                            :show-source-icon="false"
                                        >
                                        </MediaSourceIndicator>
                                    </template>
                                    <MediaDropZone
                                        ref="mediaDropZone"
                                        :replace-url="track.Url"
                                        :track-id="track.Id"
                                        @accepted="acceptedMedia()"
                                    >
                                    </MediaDropZone>
                                </CoveredPanel>
                            </div>
                            <!-- Title (make it wide) -->
                            <div class="level-item is-flex-grow-2">
                                <LabeledInput
                                    label="Title"
                                    class="is-fullwidth"
                                >
                                    <StyledInput
                                        class="input"
                                        :model-value="track?.Name"
                                        type="text"
                                        placeholder="Track name"
                                        title="Track name"
                                        data-cy="track-name-input"
                                        :focus-on-mounted="false"
                                        @change="
                                            updateName($event.target.value)
                                        "
                                    />
                                </LabeledInput>
                            </div>
                        </template>
                    </div>
                    <!-- Right side -->
                    <div class="level-right is-justify-content-flex-end">
                        <!-- Slot for additional level items -->
                    </div>
                </div>
            </div>
            <Transition name="item-expand">
                <PdfElement
                    v-if="(isExpanded || isFullscreen) && mediaUrl"
                    class="block"
                    :media-url="mediaUrl"
                    :is-fullscreen="isFullscreen"
                ></PdfElement>
                <!-- <PdfViewer
                    v-if="(isExpanded || isFullscreen) && mediaUrl"
                    class="block"
                    :media-url="mediaUrl"
                    :is-fullscreen="isFullscreen"
                ></PdfViewer> -->
            </Transition>
            <!-- Spacer -->
            <div class="block"></div>
        </FullscreenPanel>
    </div>
</template>

<script setup lang="ts">
/** A track variant that displays a PDF document, either as link or as an expandable inline viewer */
import { type PropType, computed, type Ref, ref } from 'vue';
import { useAppStore } from '@/store/app';
import type { ITrack } from '@/store/ITrack';
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import CoveredPanel from '@/components/CoveredPanel.vue';
import MediaSourceIndicator from '@/components/indicators/MediaSourceIndicator.vue';
import LabeledInput from '@/components/editor/LabeledInput.vue';
import StyledInput from '@/components/StyledInput.vue';
import TrackTitleName from '@/components/track/TrackTitleName.vue';
import FullscreenPanel from '@/components/FullscreenPanel.vue';
import FullscreenToggler from '@/components/buttons/FullscreenToggler.vue';
import { mdiSwapVertical, mdiFilePdfBox } from '@mdi/js';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { storeToRefs } from 'pinia';
// import PdfViewer from '@/components/track/PdfViewer.vue';
import PdfElement from '@/components/track/PdfElement.vue';

const props = defineProps({
    /** The track to display
     */
    track: {
        type: Object as PropType<ITrack>,
        required: true,
    },
});

const app = useAppStore();
const { isTrackEditable, isTrackPlayable } = storeToRefs(app);

/** Whether the pdf is currently expanded */
const isExpanded = ref(false);

/** Gets the effective media source URL for this track
 */
const mediaUrl = computed(() => {
    return app.getMediaUrlByTrack(props.track);
});

// --- drop zone handling ---

const mediaDropZonePanel: Ref<typeof CoveredPanel | null> = ref(null);

function acceptedMedia() {
    mediaDropZonePanel.value?.cover();
}

// --- update ---

/** Updates the track name */
function updateName(name: string) {
    const trackId = props.track.Id;
    const artist = props.track.Artist;
    const album = props.track.Album;

    app.updateTrackData(trackId, name, artist, album);
}
</script>

<style>
.top-right {
    right: 0;
    position: absolute;
    top: 0;
}

.track .notification {
    /** Make single-lined text vertically aligned with the close button,
    similar padding for left, for consistency */
    padding: calc(0.5rem + 2px);
    padding-right: 2.5rem;
    min-height: 40px;
}
</style>

<style lang="scss" scoped>
/* Track item styles*/

/* Define an overall width allocation for fixed right-hand side of the playback control level items*/

.level {
    .level-left {
        /* 
        The value for the basis have been empirically found to work best on
        Google Chrome, Brave and Firefox, on Ubuntu
        for the given set of playback controls
        (slider, next/previous cue, playback mode, pre-roll toggler, fading toggler, volume knob, playback indicator)*/
        flex-basis: calc(100% - 0px);
        .level-item {
            flex-shrink: 1;
        }
    }
    .level-right {
        flex-basis: 0px;
        .level-item {
            flex-shrink: 1;
        }
    }
}
/*Note: The used width is smaller in edit mode, since there are less buttons on the right side (no track skip, no play/pause)*/
.level.is-editable {
    .level-left {
        flex-basis: auto;
    }
    .level-right {
        flex-basis: auto;
    }
}

.is-fullwidth {
    width: 100%;
}
</style>
