<template>
    <div>
        <span class="has-opacity-half">
            {{ title }}
        </span>

        <audio :id="'audioelement' + src" :src="src" controls></audio>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

//TODO currently not used, remove?
export default defineComponent({
    props: {
        title: String,
        src: String,
    },
});
</script>
<style scoped>
.has-opacity-half {
    opacity: 50%;
}
</style>
