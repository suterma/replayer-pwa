<script setup lang="ts">
import { ref } from 'vue'

import Designer from './Designer.vue'
import ControlKnob from './ControlKnob.vue'

const options = {
  imageSize: 80,
  showValue: false,
  tickLength: 40,
  tickOffset: -3,
  tickStroke: 1,
  rimStroke: 2,
  valueArchStroke: 5,
  bgRadius: 39,
  tabIndex: 1,
  rimClass: 'text-black/90',
  bgClass: 'text-[#36485A]',
  tickClass: 'text-[#8CE69F]',
}

const vmodel = ref(0)
</script>
<template>
  <div class="p-4 bg-[#575757] text-gray-100">
    <div>
      <h2 class="mb-6 text-xl font-semibold">Default Control Knob</h2>

      <div class="px-8">
        <ControlKnob id="knob1" v-model="vmodel" />
      </div>

      <h2 class="my-6 text-xl font-semibold">Modified Control Knob</h2>

      <div class="px-8">
        <ControlKnob id="knob2" v-model="vmodel" :options="options" />
      </div>

      <h2 class="mb-6 text-xl font-semibold">Control Knob with passive event handling (not preventing scrolling)</h2>

      <div class="px-8">
        <ControlKnob id="knob1" v-model="vmodel" :options="{ passiveEvents: true }" />
      </div>
    </div>
    <div v-if="false">
      <h2 class="mb-6 text-3xl font-semibold">Knob Designer</h2>
      <Designer />
    </div>
  </div>
</template>
