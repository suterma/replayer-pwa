<template>
    <!-- The footer (as fixed navbar) -->
    <nav
        class="navbar is-fixed-bottom is-light"
        role="footer"
        aria-label="footer"
    >
        <div class="navbar-start">
            <div class="navbar-item">
                <div class="field">
                    <ProgressText />
                </div>
            </div>
        </div>
        <div class="navbar-end">
            <div class="navbar-item">
                <div class="field">
                    Replayer by
                    <a href="https://marcelsuter.ch">Marcel Suter</a>
                </div>
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ProgressText from '@/components/ProgressText.vue'

/** A top navbar for the application*/
export default defineComponent({
    name: 'NavbarBottom',
    components: { ProgressText },
})
</script>
