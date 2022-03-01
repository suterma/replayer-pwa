<template>
    <!-- Level, also on mobile -->
    <nav class="level is-mobile">
        <!-- Left side -->
        <div class="level-left">
            <div class="level-item">
                <EditableInput
                    v-if="this.isEditable"
                    v-model="title"
                    @change="updateTitle($event.target.value)"
                    placeholder="Compilation title"
                />
                <p v-else class="title is-3">{{ this.compilation.Title }}</p>
            </div>
        </div>
        <!-- Right side -->
        <div class="level-right">
            <div class="level-item">
                <span class="is-pulled-right ml-3">
                    <DropdownMenu title="Compilation context menu">
                        <DropdownMenuItem
                            title="Prevent screen timeout"
                            subTitle="(while this compilation is open)"
                            :class="{
                                'is-active': this.isPreventingScreenTimeoutNow,
                            }"
                            @click="togglePreventScreenTimeoutNow"
                        />

                        <a
                            href="#"
                            class="dropdown-item"
                            @click="downloadRezPackage"
                        >
                            Download as
                            <span class="has-text-weight-bold">ZIP</span><br />
                            <span class="has-opacity-half is-size-7">
                                (<span class="is-family-monospace">.rez</span>),
                                including media files
                            </span>
                        </a>
                        <a
                            href="#"
                            class="dropdown-item"
                            @click="downloadRexFile"
                        >
                            Download as
                            <span class="has-text-weight-bold">XML</span><br />
                            <span class="has-opacity-half is-size-7">
                                (<span class="is-family-monospace">.rex</span>),
                                without media files
                            </span>
                        </a>
                        <hr class="dropdown-divider" />
                        <DropdownMenuItem
                            title="Close"
                            subTitle="(discard the compilation)"
                            @click="close"
                        />
                    </DropdownMenu>
                </span>
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MutationTypes } from '@/store/mutation-types';
import NoSleep from 'nosleep.js';
import { ActionTypes } from '@/store/action-types';
import { Compilation, ICompilation } from '@/store/compilation-types';
import EditableInput from '@/components/EditableInput.vue';
import DropdownMenu from '@/components/DropdownMenu.vue';
import DropdownMenuItem from '@/components/DropdownMenuItem.vue';

/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'CompilationHeader',
    components: { EditableInput, DropdownMenu, DropdownMenuItem },
    props: {
        compilation: {
            type: Compilation,
            required: true,
        },
        /** Whether this component show editable inputs for the contained data
         * @devdoc Allows to reuse this component for more than one DisplayMode.
         */
        isEditable: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            /** Whether the dropdown menu is shown as expanded.
             */
            isDropdownExpanded: false,
            /** The wake lock fill-in that can prevent screen timeout, while a compilation is in use */
            noSleep: new NoSleep(),
            /** The compilation title */
            title: this.compilation.Title,
        };
    },
    methods: {
        /** Closes the compilation
         */
        close(): void {
            this.$store.commit(MutationTypes.CLOSE_COMPILATION);
        },
        /** Updates the compilation title */
        updateTitle(title: string) {
            this.$store.dispatch(ActionTypes.UPDATE_COMPILATION_TITLE, title);
        },
        /** Initiates the download of the current compilation as a single XML (.rex) file
         */
        async downloadRexFile(): Promise<void> {
            this.$store.dispatch(ActionTypes.DOWNLOAD_REX_FILE);
        },

        /** Initiates the download of the current compilation as a ZIP (.rez) package
         */
        async downloadRezPackage(): Promise<void> {
            this.$store.dispatch(ActionTypes.DOWNLOAD_REZ_PACKAGE);
        },

        toggleDropdownExpanded() {
            this.isDropdownExpanded = !this.isDropdownExpanded;
        },
        collapseDropdown() {
            this.isDropdownExpanded = false;
        },
        expandDropdown() {
            this.isDropdownExpanded = true;
        },
        togglePreventScreenTimeoutNow() {
            if (this.isPreventingScreenTimeoutNow) {
                this.noSleep.disable();
            } else {
                this.noSleep.enable();
            }
        },
    },
    unmounted() {
        this.noSleep.disable();
    },
    watch: {
        compilation(compilation: ICompilation) {
            this.title = compilation.Title;
        },
    },
    computed: {
        isPreventingScreenTimeoutNow(): boolean {
            return this.noSleep.isEnabled;
        },
    },
});
</script>
<style lang="scss" scoped>
/** Custom modification for the level in the context of a compilation.
* @remarks Allow the title text (on the left) to break between words, 
* and keep the context items (on the right) as close as reasonably possible */
.level {
    .level-left {
        word-break: break-word;
        /* This basis is set empirically to fit for two elements on the right */
        flex-basis: calc(100% - 80px);

        /* These items should grow, and shrink */
        .level-item {
            flex-shrink: 1;
            flex-grow: 1;
            text-align: left;
            /* Title, always justify left */
            justify-content: left;
        }
    }

    .level-right {
        min-width: 0;

        /* Keep the right hand items (menu) as small as possible */
        flex-basis: 0;

        /* These items should keep their size */
        .level-item {
            flex-shrink: 0;
            flex-grow: 0;
            text-align: right;
        }
    }
}
</style>
