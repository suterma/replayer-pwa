<template>
    <NavbarTop />

    <!-- The page content -->
    <section class="section">
        <div id="content" class="content">
            <router-view />
            <div :class="{ modal: true, 'is-active': hasProgressMessage }">
                <div class="modal-background"></div>
                <div class="modal-content">
                    <progress class="progress" max="100"></progress>

                    <div class="has-text-centered">
                        {{ progressMessage }}
                    </div>
                </div>
                <!-- <button
                    class="modal-close is-large"
                    aria-label="close"
                ></button> -->
            </div>
        </div>
    </section>

    <NavbarBottom />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import NavbarTop from '@/components/NavbarTop.vue';
import NavbarBottom from '@/components/NavbarBottom.vue';

export default defineComponent({
    name: 'App',
    components: { NavbarTop, NavbarBottom },
    computed: {
        progressMessage(): string {
            return this.$store.getters.progressMessage;
        },
        hasProgressMessage(): boolean {
            return (
                this.progressMessage != null && this.progressMessage.length > 0
            );
        },
    },
});
</script>
