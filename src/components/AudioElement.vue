<template>
    <div>
        {{ title }} by {{ artist }} on {{ album }}
        <audio id="audioelement" controls autoplay></audio>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

@Options({
    props: {
        title: String,
        artist: String,
        album: String,
    },
})
export default class AudioElement extends Vue {
    title!: string;
    artist!: string;
    album!: string;
}
</script>
