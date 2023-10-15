<template>
    <MediaSourceIndicator
        v-if="!editMode"
        class="is-flex is-align-items-center"
        :source="trackUrl"
        @click="toggleEditMode()"
    >
        <slot></slot>
        <!-- Edit -->
        <!-- To not disturb the original layout by the edit button, just position it absolutely,
            and introduce a margin on the original text. -->
        <NavButton
            :iconPath="mdiPencilOutline"
            title="Click to edit the media source"
        />
    </MediaSourceIndicator>
    <DismissiblePanel v-else @dismissed="exit" hotkey>
        <MediaDropZone
            :replaceUrl="trackUrl"
            :trackId="trackId"
            ref="mediaDropZone"
        >
            <NavButton
                @click="toggleEditMode()"
                :iconPath="mdiCheckBold"
                title="Click to finish editing the media source"
            />
        </MediaDropZone>
    </DismissiblePanel>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NavButton from '@/components/buttons/NavButton.vue';
import DismissiblePanel from '@/components/DismissiblePanel.vue';
import MediaSourceIndicator from '@/components/MediaSourceIndicator.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import { mdiPencilOutline, mdiCheckBold } from '@mdi/js';

/** An editor for a media source for a Track
 */
export default defineComponent({
    name: 'MediaEdit',
    components: {
        NavButton,
        MediaDropZone,
        MediaSourceIndicator,
        DismissiblePanel,
    },
    props: {
        trackId: {
            type: String,
            required: true,
        },
        trackUrl: {
            type: String,
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
        /** ends the edit mode */
        exit() {
            this.editMode = false;
        },
    },
});
</script>
<style scoped>
.is-absolute {
    bottom: -8px;
    margin: auto 0;
}
</style>
