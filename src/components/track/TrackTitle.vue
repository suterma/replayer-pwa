<template>
    <div>
        <!-- The title is the only header element that should shrink (break on words) if necessary -->
        <TrackTitleName
            class="title is-4 mr-2"
            :class="{
                'has-text-success': isActiveTrack,
                'is-5': small,
            }"
            :name="name"
        ></TrackTitleName>

        <div v-if="artist || album || meter" class="dropdown is-hoverable">
            <div class="dropdown-trigger">
                <!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC -->
                <i class="icon mdi">
                    <svg viewBox="0 0 24 24">
                        <path fill="currentColor" :d="mdiCog" />
                    </svg>
                </i>
            </div>
            <div class="dropdown-menu" role="tooltip">
                <div class="dropdown-content">
                    <div class="dropdown-item">
                        <ArtistDisplay
                            class="mr-2 is-size-7"
                            :artist="artist"
                            :album="album"
                        />
                        <MeterDisplay
                            class="mr-2 is-size-7"
                            :meter="meter"
                        ></MeterDisplay>
                    </div>
                </div>
            </div>
        </div>

        <!-- On small screens: artist and meter in an expandable small menu element -->
        <!-- //TODO implement or remove -->
        <!-- <DropdownMenu
            class="is-hidden-tablet"
            :icon-path="mdiCog"
            :render-closed="false"
            title="Track information"
            data-cy="context-menu-track-title"
        >
            <DropdownMenuItem>
                s 453 3245 3245 3 456543 4353523 5 3
                <MenuItemContent title="Shift">
                    fasdf sadf sdf sadf sdaf sadf sadf sadf sadf sadfsdf sadfsa
                    fsaf sadf sdf
                    <ArtistDisplay
                        class="mr-2 is-size-7"
                        :artist="artist"
                        :album="album"
                    />
                    <MeterDisplay
                        class="mr-2 is-size-7"
                        :meter="meter"
                    ></MeterDisplay>
                </MenuItemContent>
            </DropdownMenuItem>
        </DropdownMenu> -->

        <!-- On larger screens: artist and meter always displayed -->
        <span class="is-hidden-mobile">
            <ArtistDisplay
                class="mr-2 is-size-7"
                :artist="artist"
                :album="album"
            />
            <MeterDisplay class="mr-2 is-size-7" :meter="meter"></MeterDisplay>
        </span>

        <TagsDisplay
            v-if="hasTags && props.tags"
            class="ml-0 is-size-7"
            :tags="trackTags"
            small
            readonly
        ></TagsDisplay>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onUnmounted } from 'vue';
import TrackTitleName from '@/components/track/TrackTitleName.vue';
import MeterDisplay from '@/components/displays/MeterDisplay.vue';
import ArtistDisplay from '@/components/displays/ArtistDisplay.vue';
import TagsDisplay from '@/components/displays/TagsDisplay.vue';
import { createTrackStore } from '@/store/track/index';
import NavButton from '@/components/buttons/NavButton.vue';
import { mdiDotsVertical } from '@mdi/js';

import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import MenuItemContent from '@/components/dropdown-menu/MenuItemContent.vue';
import { mdiCog } from '@mdi/js';
import type { IMediaHandler } from '@/code/media/IMediaHandler';
import { DefaultPitchShift, DefaultPlaybackRate } from '@/store/Track';
import SpeedKnob from '../controls/SpeedKnob.vue';
import DropdownMenuItem from '@/components/dropdown-menu/DropdownMenuItem.vue';

/** Displays a track's title, including name, meter, BPM and tags.
 * @remarks This component makes some layout decisions, but intentionally color decisions.
 */
const props = defineProps({
    /** The id of the track to handle
     */
    trackId: {
        type: String,
        required: true,
    },
    /** Whether to use a smaller font */
    small: {
        type: Boolean,
        required: false,
        default: false,
    },

    /** Whether to show the tags (if any) */
    tags: {
        type: Boolean,
        required: false,
        default: false,
    },
});

// --- tracking the associated ITrack

/** The dynamic track store for this component.
 * @remarks Code inside the setup script runs once per component instance,
 * thus the track store must be destroyed after component unload.
 */
const trackStore = createTrackStore(props.trackId);
const {
    isActiveTrack,
    meter,
    hasTags,
    name,
    tags: trackTags,
    artist,
    album,
} = storeToRefs(trackStore);

onUnmounted(() => {
    trackStore.$dispose();
});
</script>
