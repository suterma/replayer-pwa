<template>
    <div
        :class="{
            box: true,
            'has-background-info-dark': this.isDraggingOver,
        }"
        @dragover="dragover"
        @dragleave="dragleave"
        @drop="drop"
    >
        //TODO has-outline-success bei mouse-enter erstellen
        <input
            type="file"
            multiple
            name="fields[assetsFieldHandle][]"
            id="assetsFieldHandle"
            class="is-hidden w-px h-px opacity-0 overflow-hidden absolute"
            @change="onChange"
            ref="file"
            accept=".rez,.zip,.xml,.rex,.mp3"
        />

        <label for="assetsFieldHandle" class="block cursor-pointer">
            <div><a href="#">Click here</a> or drop to add file(s):</div>
        </label>
        <ul class="mt-4" v-if="this.filelist.length" v-cloak>
            <li class="text-sm p-1" v-for="file in filelist" :key="file">
                {{ file.name
                }}<button
                    class="ml-2"
                    type="button"
                    @click="remove(filelist.indexOf(file))"
                    title="Remove file"
                >
                    remove
                </button>
            </li>
        </ul>
    </div>
    <div class="level-item">&mdash; OR &mdash;</div>
    <div class="field">
        <label class="label">Paste an URL to a file</label>
        <div class="control">
            //TODO implement handling
            <input class="input" type="text" placeholder="Paste an URL" />
        </div>
        <p class="help">
            Must be a location with a resource of one of the above
        </p>
    </div>
    <div class="content">
        <SupportedFilesText />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SupportedFilesText from '@/components/SupportedFilesText.vue';
import { ActionTypes } from '@/store/action-types';

//import { MediaUrl } from '@/store/state-types';

/** AcceptsShows the available media URLs as a tag list
 * @remarks Also allows removal of the media URLs
 */
export default defineComponent({
    name: 'MediaDropZone',
    components: { SupportedFilesText },
    props: {},
    delimiters: ['${', '}'], // Avoid Twig conflicts
    data: () => ({
        /** Store our uploaded files
         */
        filelist: new Array<File>(),
        /** Indicates whether there is currently a dragging operation ongoing */
        isDraggingOver: false,
    }),
    methods: {
        onChange() {
            this.filelist = [
                ...((this.$refs.file as HTMLInputElement)
                    .files as unknown as File[]),
            ];

            this.loadFiles();
        },
        /** Immediately loads all available files by loading their content
         */
        async loadFiles(): Promise<void> {
            Array.from(this.filelist).forEach((file) => {
                this.loadFile(file);
            });
        },

        /** Loads a single file by loading it's content
         */
        async loadFile(file: File): Promise<void> {
            this.$store.dispatch(ActionTypes.LOAD_FROM_FILE, file);
        },

        remove(i: number) {
            this.filelist.splice(i, 1);
        },
        dragover(event: DragEvent) {
            event.preventDefault();
            // Add some visual fluff to show the user can drop its files
            console.debug('Dragging over...');
            this.isDraggingOver = true;
        },
        dragleave(/*event: Event*/) {
            // Clean up
            console.debug('Drag leaves');
            this.isDraggingOver = false;
        },
        drop(event: DragEvent) {
            event.preventDefault();
            const draggedFiles = event?.dataTransfer?.files;
            if (draggedFiles) {
                const fileElement = this.$refs.file as HTMLInputElement;
                if (fileElement) {
                    fileElement.files = draggedFiles;
                    this.onChange(); // Trigger the onChange event manually
                    this.isDraggingOver = false;
                }
            }
        },
    },
    computed: {},
});
</script>
<style scoped>
[v-cloak] {
    display: none;
}
</style>
