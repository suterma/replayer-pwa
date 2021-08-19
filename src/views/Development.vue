<template>
    <div class="development">
        <RezLoader />
        <hr />
        //TODO's
        <ul>
            <li>
                Create players for all files individually. Find a suitable
                ready-made component for this
            </li>
            <li>Parse the XML compilation and show the content</li>
            <li>Select a UI framework</li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RezLoader from '@/components/RezLoader.vue'; // @ is an alias to /src

export default defineComponent({
    components: {
        RezLoader,
    },
});
</script>
