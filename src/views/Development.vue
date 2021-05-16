<template>
    <div class="development">
        <img alt="Vue logo" src="../assets/logo.png" />
<p>
        //TODO's
        <ul>
            <li>LOAD a REZ file and show the content/file names                
            </li>
            <li>Play the first mp3 file automatically                
            </li>
            <li>Parse the XML compilation and show the content
            </li>
            <li>Select a UI framework
            </li>
        </ul>
</p>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
    components: {},
})
export default class Development extends Vue {}
</script>
