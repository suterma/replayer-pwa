<template>
    <div>
        {{ title }} by {{ artist }} on {{ album }}
        <audio id="audioelement" controls autoplay></audio>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

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
