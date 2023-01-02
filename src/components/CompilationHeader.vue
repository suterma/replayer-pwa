<template>
    <!-- Level, also on mobile -->
    <nav class="level is-mobile">
        <div class="level-left">
            <div class="level-item">
                <div class="field is-fullwidth">
                    <p class="control is-expanded">
                        <StyledInput
                            v-if="
                                isEditable &&
                                (title || compilation.Tracks.length > 1)
                            "
                            class="input title is-3"
                            v-model="title"
                            @change="updateTitle($event.target.value)"
                            placeholder="Compilation title"
                            title="Compilation title"
                        />
                        <span v-else class="title is-3">
                            {{ title }} &nbsp;
                            <!-- add placeholder for layout consistency -->
                        </span>
                    </p>
                </div>
            </div>
        </div>
        <!-- Context menu on the right side -->
        <div class="level-right">
            <div class="level-item is-narrow">
                <span class="is-pulled-right ml-3">
                    <CompilationContextMenu :compilation="compilation" />
                </span>
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ActionTypes } from '@/store/action-types';
import { Compilation, ICompilation } from '@/store/compilation-types';
import StyledInput from '@/components/StyledInput.vue';
import CompilationContextMenu from '@/components/context-menu/CompilationContextMenu.vue';

/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'CompilationHeader',
    components: { StyledInput, CompilationContextMenu },
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
            /** The compilation title */
            title: this.compilation.Title,
        };
    },
    methods: {
        /** Updates the compilation title */
        updateTitle(title: string) {
            this.$store.dispatch(ActionTypes.UPDATE_COMPILATION_TITLE, title);
        },
    },

    watch: {
        compilation(compilation: ICompilation) {
            this.title = compilation.Title;
        },
    },
});
</script>
<style lang="scss" scoped>
.is-fullwidth {
    width: 100%;
}
/** Custom modification for the level in the context of a compilation.
* @remarks Allow the title text (on the left) to break between words, 
* and keep the context items (on the right) as close as reasonably possible */
.level {
    .level-left {
        word-break: break-word;
        flex-basis: calc(100%);

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
