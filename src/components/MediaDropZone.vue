<template>
    <nav class="level">
        <div class="level-left">
            <div class="level-item has-text-centered">
                <div
                    :class="{
                        box: true,
                        'has-background-black': true,
                        'has-background-info-dark': this.isDraggingOver,
                        'has-border-info': this.isDraggingOver,
                    }"
                    @dragover="dragover"
                    @dragleave="dragleave"
                    @drop="drop"
                >
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
                    <span
                        :class="{
                            icon: true,
                        }"
                    >
                        <i class="mdi mdi-24px">
                            <svg
                                style="width: 24px; height: 24px"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                                />
                            </svg>
                        </i>
                    </span>

                    <label for="assetsFieldHandle" class="block cursor-pointer">
                        Click or drop to add file(s)
                    </label>
                    <!-- <ul class="mt-4" v-if="this.filelist.length" v-cloak>
                        <li
                            class="text-sm p-1"
                            v-for="file in filelist"
                            :key="file"
                        >
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
                    </ul> -->
                </div>
            </div>
        </div>
        <div class="level-item has-text-centered">
            <div class="ml-3 mr-3">&mdash; OR &mdash;</div>
        </div>
        <div class="level-right">
            <div class="level-item has-text-centered">
                <div class="field">
                    <!-- <label class="label">Paste an URL to a file</label> -->
                    <div class="control">
                        <input
                            class="input"
                            type="url"
                            placeholder="Paste an URL"
                            @change="loadUrl"
                            size="60"
                        />
                    </div>
                    <!-- <p class="help">
            Must be a location with a resource of one of the above
        </p> -->
                </div>
            </div>
        </div>
    </nav>

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
        /** Checks whether a file is supported by examining mime type and/or ending */
        isSupported(file: File): boolean {
            console.log('Filename: ' + file.name);
            console.log('Type: ' + file.type);
            console.log('Size: ' + file.size + ' bytes');
            //Check for supported file types (see https://stackoverflow.com/a/29672957)
            if (
                [
                    'audio/mpeg' /*mp3*/,
                    'application/zip' /*zip*/,
                    'application/x-zip-compressed' /*zip*/,
                    'application/xml' /*xml*/,
                    'text/xml' /*xml*/,
                ].includes(file.type)
            ) {
                return true;
            }
            //Check for supported file extensions
            if (file && file.name) {
                const fileExtension = file.name.split('.').pop()?.toLowerCase();
                if (fileExtension) {
                    if (
                        [
                            'mp3',
                            'zip',
                            'rez' /*replayer zip*/,
                            'xml',
                            'rex' /*replaer xml*/,
                        ].includes(fileExtension)
                    ) {
                        return true;
                    }
                }
            }

            console.warn(
                'File with mime type ' + file.type + ' is not supported',
            );
            return false;
        },

        /** Immediately loads all available files by loading their content
         */
        async loadFiles(): Promise<void> {
            Array.from(this.filelist).forEach((file) => {
                if (this.isSupported(file)) {
                    this.loadFile(file);
                }
                this.filelist.pop();
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
        /** Loads a single URL by loading it's content
         */
        async loadUrl(event: Event): Promise<void> {
            console.debug(
                'MediaDropZone::loadUrl:event:',
                (event.target as HTMLInputElement).value,
            );

            const url = (event.target as HTMLInputElement).value;
            if (url) {
                this.$store.dispatch(
                    ActionTypes.LOAD_FROM_URL,
                    (event.target as HTMLInputElement).value,
                );
            }
        },
    },
    computed: {},
});
</script>
<style scoped>
/* [v-cloak] {
    display: none;
} */

/** Style the box like a typical drop zone */
.box {
    border-width: 1px;
    border-style: dashed;
    background-color: transparent;
}
</style>
