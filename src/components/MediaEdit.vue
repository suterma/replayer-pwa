<template>
    <!-- align like a bulma level, vertically centered -->
    <div class="is-flex is-align-items-center" v-click-outside="acceptValue">
        <template v-if="!editMode">
            <MediaSourceIndicator :source="track.Url" @click="toggleEditMode()">
                <!-- Edit -->
                <!-- To not disturb the original layout by the edit button, just position it absolutely,
            and introduce a margin on the original text. -->
                <NavButton
                    class="is-absolute"
                    :iconPath="mdiPencilOutline"
                    title="Click to edit the media source"
                />
            </MediaSourceIndicator>
        </template>
        <template v-else>
            <MediaDropZone
                :isExpanded="true"
                :replaceUrl="track.Url"
                :trackId="track.Id"
                ref="mediaDropZone"
            >
                <NavButton
                    @click="toggleEditMode()"
                    :iconPath="mdiCheckBold"
                    title="Click to finish editing the media source"
                />
            </MediaDropZone>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NavButton from '@/components/buttons/NavButton.vue';
import MediaSourceIndicator from '@/components/MediaSourceIndicator.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import { Track } from '@/store/compilation-types';
import { mdiPencilOutline, mdiCheckBold } from '@mdi/js';

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
    data() {
        return {
            /** Whether the input is in Edit mode */
            editMode: false,

            /** Icons from @mdi/js */
            mdiCheckBold: mdiCheckBold,
            mdiPencilOutline: mdiPencilOutline,
        };
    },
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
<style scoped>
.mr-40px {
    margin-right: 40px;
}

.is-absolute {
    bottom: -8px;
    margin: auto 0;
}
</style>
