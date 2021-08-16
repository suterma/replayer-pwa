<template>
    <div>
        {{ title }} by {{ artist }} on {{ album }}
        <audio :id="'audioelement' + src" :src="src" controls></audio>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        title: String,
        artist: String,
        album: String,
        src: String,
    },
});
</script>
