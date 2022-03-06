<template>
    <MediaSourceIndicator v-if="!editMode" :source="this.track.Url" />
    <MediaDropZone
        v-else
        :isExpanded="true"
        :replaceUrl="this.track.Url"
        :trackId="this.track.Id"
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
    },
    computed: {},
});
</script>
<style scoped></style>
