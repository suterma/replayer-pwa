<template>
    <div
        class="track is-pdf is-together-print"
        :class="{
            'is-editable': trackViewMode == TrackViewMode.Edit,
        }"
        data-cy="track-pdf"
    >
        <div class="block">
            <!-- Header -->
            <div class="track-header level is-mobile is-align-items-flex-start">
                <!-- Left side -->
                <div
                    class="level-left level-wrap is-justify-content-flex-start"
                >
                    <!-- Expander -->
                    <div class="level-item is-narrow">
                        <CollapsibleButton
                            class="is-nav"
                            :model-value="isExpanded"
                            title="PDF"
                            collapsed-text="Click to expand / show PDF"
                            expanded-text="Click to collapse"
                            @update:model-value="isExpanded = !isExpanded"
                        >
                        </CollapsibleButton>
                    </div>

                    <!-- The edit part -->
                    <template v-if="trackViewMode === TrackViewMode.Edit">
                        <CoveredPanel
                            class="level-item"
                            ref="mediaDropZonePanel"
                        >
                            <template #caption>
                                <MediaSourceIndicator
                                    :source="track?.Url"
                                    :unavailable="!mediaUrl"
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

                        <!-- Title (make it wide) -->
                        <div class="level-item is-flex-grow-2">
                            <LabeledInput label="Title" class="is-fullwidth">
                                <StyledInput
                                    class="input"
                                    :model-value="track?.Name"
                                    type="text"
                                    placeholder="Track name"
                                    title="Track name"
                                    data-cy="track-name-input"
                                    :focus-on-mounted="false"
                                    @change="updateName($event.target.value)"
                                />
                            </LabeledInput>
                        </div>
                        <!-- <CoveredPanel
                            :reveal-for="[track.Artist]"
                            title="Artist name for this track"
                            class="level-item"
                        >
                            <template #caption>
                                <span class="label">by</span>
                            </template>

                            <div class="field is-fullwidth">
                                <p class="control is-expanded">
                                    <LabeledInput label="by">
                                        <StyledInput
                                            class="input is-italic"
                                            :model-value="track.Artist"
                                            type="text"
                                            placeholder="Artist"
                                            title="Artist"
                                            data-cy="track-artist"
                                            focus-on-mounted
                                            @update:model-value="
                                                (value) => {
                                                    updateArtist(value);
                                                }
                                            "
                                        >
                                        </StyledInput>
                                    </LabeledInput>
                                </p>
                            </div>
                        </CoveredPanel>
                        <CoveredPanel
                            :reveal-for="[track.Album]"
                            title="Album name for this track"
                            class="level-item"
                        >
                            <template #caption
                                ><span class="label">on</span></template
                            >

                            <div class="field is-fullwidth">
                                <p class="control is-expanded">
                                    <LabeledInput label="on">
                                        <StyledInput
                                            class="input is-italic"
                                            :model-value="track.Album"
                                            type="text"
                                            placeholder="Album"
                                            title="Album"
                                            data-cy="track-album"
                                            focus-on-mounted
                                            @update:model-value="
                                                (value) => {
                                                    updateAlbum(value);
                                                }
                                            "
                                        >
                                        </StyledInput>
                                    </LabeledInput>
                                </p>
                            </div>
                        </CoveredPanel> -->
                    </template>

                    <!-- Title -->
                    <!-- The title is the only header element that should shrink (break on words) if necessary -->
                    <div
                        v-else
                        class="is-flex-shrink-1"
                        :class="{
                            'is-clickable': Boolean(mediaUrl),
                            'has-cursor-not-allowed': !Boolean(mediaUrl),
                        }"
                        @click="isExpanded = !isExpanded"
                    >
                        <p class="title is-4" :title="track.Url">
                            <TrackTitleName :name="track.Name"></TrackTitleName>
                        </p>
                    </div>
                </div>
                <!-- Right side -->
                <div class="level-right is-justify-content-flex-end">
                    <div class="level-item"></div>
                    <!-- Slot for additional level items -->
                </div>
            </div>
        </div>
        <Transition name="item-expand">
            <div class="block video-containerx is-smallx" v-if="isExpanded">
                <object
                    class="videox"
                    :data="mediaUrl"
                    type="application/pdf"
                    width="100%"
                    :height="objectHeight"
                ></object>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
/** A track variant that displays a PDF document, either as link or as an expandable inline viewer */
import { type PropType, computed, type Ref, ref, inject } from 'vue';
import { useAppStore } from '@/store/app';
import type { ITrack } from '@/store/ITrack';
import { trackViewModeInjectionKey } from '@/components/track/TrackInjectionKeys';
import { TrackViewMode } from '@/store/TrackViewMode';
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import CoveredPanel from '@/components/CoveredPanel.vue';
import MediaSourceIndicator from '@/components/indicators/MediaSourceIndicator.vue';
import LabeledInput from '@/components/editor/LabeledInput.vue';
import StyledInput from '@/components/StyledInput.vue';
import TrackTitleName from '@/components/track/TrackTitleName.vue';
import { useWindowSize } from '@vueuse/core';

const props = defineProps({
    /** The track to display
     */
    track: {
        type: Object as PropType<ITrack>,
        required: true,
    },
});

const trackViewMode = inject(trackViewModeInjectionKey);

/** Whether the pdf is currently expanded */
const isExpanded = ref(false);

const app = useAppStore();

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

/** Updates the track artist */
function updateArtist(artist: string) {
    const trackId = props.track.Id;
    const name = props.track.Name;
    const album = props.track.Album;
    app.updateTrackData(trackId, name, artist, album);
}

/** Updates the track album */
function updateAlbum(album: string) {
    const trackId = props.track.Id;
    const name = props.track.Name;
    const artist = props.track.Artist;
    app.updateTrackData(trackId, name, artist, album);
}

// --- size ---

const { width, height } = useWindowSize();

const objectHeight = computed(() => {
    return height.value;
});
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
