<template>
    <div :class="{ modal: true, 'is-active': hasDisplayText }">
        <div class="modal-background"></div>
        <div class="modal-content has-text-centered">
            <!-- <h1 class="has-text-centered">Key</h1> -->

            <!-- <div class="has-text-centered">
                <span class="tag is-dark is-large"> {{ displayText }}</span>
            </div> -->
            <!-- <div class="tags has-addons">
                <span class="tag is-large is-white is-size-mega">Key</span> -->
            <span class="tag is-dark is-large is-size-mega">{{
                displayText
            }}</span>
            <!-- </div> -->
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
/** A simple overlay to display handeled keyboard shortcuts */
export default defineComponent({
    name: 'KeyResponseOverlay',
    components: {},
    props: {
        /** The character representation of the currently pressed key (or keys, when handling a shortcut) */
        keyText: null,
    },
    data() {
        return {
            /** The text to display, which is single key or a short key sequence */
            displayText: '',
            /** A timeout id, to handle timeout extensions for prolonged display of text in handling a quick sequence of keys*/
            keyTimeoutId: new Object() as ReturnType<typeof setTimeout>,
        };
    },
    computed: {
        hasDisplayText(): boolean {
            return this.displayText != null && this.displayText.length > 0;
        },
    },
    watch: {},
    methods: {
        /** Displays the given key for a short duration */
        DisplayKey(key: string) {
            //Clear the probably existing timeout
            clearTimeout(this.keyTimeoutId);
            if (key) {
                this.displayText = key;
                this.keyTimeoutId = setTimeout(
                    () => (this.displayText = ''),
                    500,
                );
            } else {
                this.displayText = '';
            }
        },
    },
});
</script>
<style scoped>
.is-size-mega {
    /* font-size: 6rem !important; */
    /** very large */
    font-size: 10vw !important;
}
</style>
