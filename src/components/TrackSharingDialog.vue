<template>
    <div class="modal is-active">
        <div class="modal-background"></div>
        <Experimental>
            <div class="modal-card">
                <header class="modal-card-head">
                    <h1 class="modal-card-title title">
                        Sharing {{ track?.Title }}
                    </h1>
                </header>
                <section class="modal-card-body">//TODO</section>
                <footer class="modal-card-foot is-justify-content-flex-end">
                    <div class="field is-grouped">
                        <p class="control">
                            <button class="button" @click="$close(this, false)">
                                Cancel
                            </button>
                        </p>
                        <p class="control">
                            <button
                                v-focus
                                class="button is-success"
                                @click="$close(this)"
                            >
                                Ok
                            </button>
                        </p>
                    </div>
                </footer>
            </div>
        </Experimental>
    </div>
</template>

<script lang="ts">
import { Track } from '@/store/compilation-types';
import Experimental from '@/components/Experimental.vue';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'TrackSharingDialog',
    components: {
        Experimental,
    },
    props: {
        track: {
            type: Track,
            required: true,
        },
    },
    setup() {
        function returnValue() {
            return true;
        }
        return {
            returnValue,
        };
    },
});
</script>

<style scoped></style>
