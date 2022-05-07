<template>
    <!-- align like a bulma level, vertically centered -->
    <div class="is-flex is-align-items-center" v-click-outside="acceptValue">
        <MediaSourceIndicator
            v-if="!editMode"
            :source="track.Url"
            @click="toggleEditMode()"
        />
        <MediaDropZone
            v-else
            :isExpanded="true"
            :replaceUrl="track.Url"
            :trackId="track.Id"
            ref="mediaDropZone"
        />
        <NavButton
            v-if="editMode"
            @click="toggleEditMode()"
            iconName="checkmark"
            title="Click to finish editing the media source"
        />
        <NavButton
            v-else
            @click="toggleEditMode()"
            iconName="pencil"
            title="Click to edit the media source"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NavButton from '@/components/NavButton.vue';
import MediaSourceIndicator from '@/components/MediaSourceIndicator.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import { Track } from '@/store/compilation-types';

/** An editor for a media source for a Track
 */
export default defineComponent({
    name: 'MediaEdit',
    components: { NavButton, MediaDropZone, MediaSourceIndicator },
    props: {
        track: {
            type: Track,
            required: true,
        },
    },

    data: () => ({
        /** Whether the input is in Edit mode */
        editMode: false,
    }),
    methods: {
        toggleEditMode() {
            this.editMode = !this.editMode;
        },
        /** Accept the value and end the edit mode */
        acceptValue() {
            this.editMode = false;
        },
    },
    computed: {},
});
</script>
