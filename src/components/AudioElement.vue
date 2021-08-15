<template>
    <div>
        {{ title }} by {{ artist }} on {{ album }}
        <audio id="audioelement" controls autoplay></audio>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    data() {
        return {
            title: '',
            artist: '',
            album: '',
        };
    },
});
</script>
