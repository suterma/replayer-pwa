<template>
    <!-- Level, also on mobile -->
    <nav class="level is-mobile">
        <!-- Left side -->
        <div class="level-left">
            <div class="level-item">
                <input
                    class="input title is-3"
                    :value="this.title"
                    @input="this.updateCompilation()"
                    type="text"
                    placeholder="Compilation title"
                />
                <p class="title is-3">{{ this.compilation.Title }}</p>
                <!-- v-if="this.isEditable" -->
            </div>
        </div>
        <!-- Right side -->
        <div class="level-right">
            <div class="level-item">
                <span class="is-pulled-right ml-3">
                    <div
                        :class="{
                            dropdown: true,
                            'is-right': true,
                            'is-hoverable': false,
                            'is-active': isDropdownExpanded,
                        }"
                        @click="toggleDropdownExpanded()"
                        @blur="collapseDropdown()"
                        v-click-outside="collapseDropdown"
                    >
                        <div class="dropdown-trigger">
                            <button
                                class="button is-ghost"
                                aria-haspopup="true"
                                aria-controls="dropdown-menu"
                                title="Compilation context menu"
                            >
                                <span class="icon">
                                    <i class="mdi mdi-24px">
                                        <svg
                                            style="width: 24px; height: 24px"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"
                                            />
                                        </svg>
                                    </i>
                                </span>
                            </button>
                        </div>
                        <div
                            class="dropdown-menu"
                            id="dropdown-menu"
                            role="menu"
                        >
                            <div class="dropdown-content">
                                <a
                                    href="#"
                                    :class="{
                                        'dropdown-item': true,
                                        'is-active':
                                            isPreventingScreenTimeoutNow,
                                    }"
                                    @click="togglePreventScreenTimeoutNow"
                                >
                                    Prevent screen timeout<br />
                                    <span class="has-opacity-half is-size-7">
                                        (while this compilation is in
                                        open)</span
                                    >
                                </a>
                                <a
                                    href="#"
                                    class="dropdown-item"
                                    @click="downloadRezPackage"
                                >
                                    Download as
                                    <span class="has-text-weight-bold">ZIP</span
                                    ><br />
                                    <span class="has-opacity-half is-size-7">
                                        (<span class="is-family-monospace"
                                            >.rez</span
                                        >), including media files
                                    </span>
                                </a>
                                <a
                                    href="#"
                                    class="dropdown-item"
                                    @click="downloadRexFile"
                                >
                                    Download as
                                    <span class="has-text-weight-bold">XML</span
                                    ><br />
                                    <span class="has-opacity-half is-size-7">
                                        (<span class="is-family-monospace"
                                            >.rex</span
                                        >), without media files
                                    </span>
                                </a>
                                <hr class="dropdown-divider" />
                                <a
                                    href="#"
                                    @click="close"
                                    class="dropdown-item"
                                >
                                    Close</a
                                >
                            </div>
                        </div>
                    </div>
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
import { Compilation } from '@/store/compilation-types';

/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'CompilationHeader',
    components: {},
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

        /** Updates the compilation by setting the current title */
        async updateCompilation(): Promise<void> {
            this.compilation.Title = this.title;
            this.$store.dispatch(
                ActionTypes.UPDATE_COMPILATION,
                this.compilation,
            );
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
