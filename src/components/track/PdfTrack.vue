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
                        <template
                            v-if="
                                !isFullscreen &&
                                hasNativePdfSupport &&
                                isTrackPlayable
                            "
                        >
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
                                <!-- //TODO create link when no native pdf support -->
                                <!-- Just as link without native PDF support -->
                                <!-- <div
                                    v-else
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
                                </div> -->
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
                <div
                    v-if="
                        (isExpanded &&
                            // never expand on non-edit pages without native support
                            (isTrackEditable || hasNativePdfSupport)) ||
                        isFullscreen
                    "
                    ref="pdfContainer"
                    :style="{
                        'min-height': isFullscreen
                            ? '100vh'
                            : availableHeight + 'px',
                        'max-height': isFullscreen
                            ? '100vh'
                            : availableHeight + 'px',
                        width: '100%',
                    }"
                    class="block"
                ></div>
            </Transition>
            <!-- Spacer -->
            <div class="block"></div>
        </FullscreenPanel>
    </div>
</template>

<script setup lang="ts">
/** A track variant that displays a PDF document, either as link or as an expandable inline viewer */
import { type PropType, computed, type Ref, ref, watch, inject } from 'vue';
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
import PDFObject from 'pdfobject';
import { storeToRefs } from 'pinia';
import VueScrollTo from 'vue-scrollto';

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

// --- PDF rendering ---

import { navbarCompensationHeightInjectionKey } from '@/AppInjectionKeys';
const navbarCompensationHeight = inject(navbarCompensationHeightInjectionKey);

/** Gets the net available available window height
 * @remarks This is used for convenience to the user
 */
const availableHeight = computed(() => {
    const fullvh = Math.round(window.innerHeight);
    const availableHeight = fullvh - (navbarCompensationHeight?.value ?? 0);
    return availableHeight;
});

const pdfContainer = ref(null);
watch(
    () => pdfContainer.value,
    () => {
        if (pdfContainer.value) {
            console.debug(
                'PdfTrack::Rendering PDF for mediaUrl: ',
                mediaUrl.value,
            );

            //TODO fix for full-screen, this should be the actuall full ehight then

            PDFObject.embed(mediaUrl.value, pdfContainer.value, {
                title: props.track.Name,
                pdfOpenParams: { view: 'FitH' },
                //TODO use proper CSP in combination with the sandbox
                //customAttribute: { key: 'sandbox', value: 'true' },
                height: availableHeight.value + 'px',
                width: '100%',
            });
            scrollToPdf();
        }
    },
    { immediate: true, deep: false },
);

/** Visually scrolls to the PDF, making it visually at the top of
 * the view.
 */
function scrollToPdf() {
    VueScrollTo.scrollTo(pdfContainer.value, {
        /** Always scroll, make it on top of the view */
        force: true,
        /** empirical value (taking into account the non-existing fixed top navbar) */
        offset: 0,
        /** Avoid interference with the key press overlay */
        cancelable: false,
    });
}

/** Whether this browser instance has native embedded PDF support
 * @remarks This is only updated once by the pdfobject library on app start.
 * @devdoc NOTE: The PDFObject library is only used for
 * support detection, not for PDF display, to keep the
 * Replayer implementation more concise.
 */
const hasNativePdfSupport = ref(PDFObject.supportsPDFs as Boolean);

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
