<template>
    <div class="development">
        <img alt="Vue logo" src="../assets/logo.png" />
<p>
  //Metronome
  <Metronome/>

     <RezLoader />
        //TODO's
        <ul>
            <li>Parse the XML compilation and show the content
            </li>
            <li>Select a UI framework
            </li>
        </ul>
</p>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import RezLoader from "@/components/RezLoader.vue"; // @ is an alias to /src
import Metronome from "@/components/Metronome.vue"; // @ is an alias to /src

@Options({
  components: {
    RezLoader,
    Metronome
  },
})
export default class Home extends Vue {}
</script>
