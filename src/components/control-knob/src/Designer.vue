<script setup lang="ts">
import { ref, computed } from 'vue'

// PI radians = 180 degrees
// 2PI radians = 360 degrees
// 1 radian = 180/PI degrees = 57.2957795 degrees

const RADIUS = 40
const IMAGE_VIEWBOX = 100
const HALF_VIEWBOX = IMAGE_VIEWBOX / 2
const controlAngle = ref(120)
const tickLength = ref(18)
const tickOffset = ref(10)
const lineStroke = ref(3)
const imageSize = ref(500)
const rimStroke = ref(11)
const valueArchStroke = ref(11)
const bgRadius = ref(34)
// const stepSize = 1

function degToRad(degrees: number) {
  return (degrees * Math.PI) / 180
}

const tickStartX = computed(() => {
  return HALF_VIEWBOX + Math.cos(degToRad(controlAngle.value)) * (RADIUS - tickLength.value)
})

const tickStartY = computed(() => {
  return HALF_VIEWBOX + Math.sin(degToRad(controlAngle.value)) * (RADIUS - tickLength.value)
})

const tickEndX = computed(() => {
  return HALF_VIEWBOX + Math.cos(degToRad(controlAngle.value)) * (RADIUS - tickOffset.value)
})

const tickEndY = computed(() => {
  return HALF_VIEWBOX + Math.sin(degToRad(controlAngle.value)) * (RADIUS - tickOffset.value)
})

const rimStartX = HALF_VIEWBOX + -0.5 * RADIUS
const rimStartY = HALF_VIEWBOX + Math.sin(degToRad(120)) * RADIUS
const rimEndX = HALF_VIEWBOX + 0.5 * RADIUS
const rimEndY = HALF_VIEWBOX + Math.sin(degToRad(420)) * RADIUS

const startRad = degToRad(120)
const currentValueRad = computed(() => degToRad(controlAngle.value))
const largeArch = computed(() => (Math.abs(startRad - currentValueRad.value) < Math.PI ? 0 : 1))
const sweep = ref(1)
// const sweep = computed(() => (currentValueRad.value < startRad ? 0 : 1))

const valueEndX = computed(() => 50 + Math.cos(degToRad(controlAngle.value)) * RADIUS)
const valueEndY = computed(() => 50 + Math.sin(degToRad(controlAngle.value)) * RADIUS)

const rim = `M ${rimStartX} ${rimStartY} A ${RADIUS} ${RADIUS} 0 1 1 ${rimEndX} ${rimEndY}`
const valueArch = computed(
  () =>
    `M ${rimStartX} ${rimStartY} A ${RADIUS} ${RADIUS} 0 ${largeArch.value} ${sweep.value} ${valueEndX.value} ${valueEndY.value}`
)
</script>
<template>
  <div>
    <div>
      <p>Value: {{ controlAngle }}</p>
      <input type="range" min="120" max="420" v-model="controlAngle" />
    </div>

    <div>
      <p>Tick length: {{ tickLength }}</p>
      <input type="range" min="1" max="50" v-model="tickLength" />
    </div>

    <div>
      <p>Tick offset: {{ tickOffset }}</p>
      <input type="range" min="-10" max="50" v-model="tickOffset" />
    </div>

    <div>
      <p>Tick stroke: {{ lineStroke }}</p>
      <input type="range" min="1" max="6" v-model="lineStroke" />
    </div>

    <div>
      <p>Rim stroke: {{ rimStroke }}</p>
      <input type="range" min="1" max="20" v-model="rimStroke" />
    </div>

    <div>
      <p>valueArc stroke: {{ valueArchStroke }}</p>
      <input type="range" min="1" max="20" v-model="valueArchStroke" />
    </div>

    <div>
      <p>Background radius: {{ bgRadius }}</p>
      <input type="range" min="30" max="50" v-model="bgRadius" />
    </div>

    <div>
      <p>Image width: {{ imageSize }}</p>
      <input type="range" min="40" max="500" v-model="imageSize" />
    </div>
  </div>

  <div class="flex flex-row justify-center p-4 space-x-4">
    <svg :width="imageSize" :height="imageSize" viewBox="0 0 100 100" class="">
      <circle
        :cx="HALF_VIEWBOX"
        :cy="HALF_VIEWBOX"
        :r="bgRadius"
        stroke="#868686"
        fill="#868686"
        :stroke-width="1"
      />

      <path
        :d="rim"
        :stroke-width="rimStroke"
        stroke="currentColor"
        class=""
        style="color: #393939"
        fill="none"
      ></path>

      <path
        v-if="controlAngle > 120"
        :d="valueArch"
        :stroke-width="valueArchStroke"
        stroke="currentColor"
        class=""
        style="color: #53d769"
        fill="none"
      ></path>

      <line
        :x1="tickStartX"
        :y1="tickStartY"
        :x2="tickEndX"
        :y2="tickEndY"
        stroke="black"
        :stroke-width="lineStroke"
      />

      <text
        v-if="controlAngle > 120"
        :x="50"
        :y="62"
        text-anchor="middle"
        fill="currentColor"
        class="text-gray-50 text-[30px] font-normal font-mono"
      >
        {{ Math.ceil(controlAngle / 10) }}
      </text>
    </svg>
  </div>

  <div>
    <h3 class="mt-4 mb-4 text-xl font-semibold">Debug data</h3>
    <table class="font-mono text-sm">
      <thead class="uppercase">
        <th class="w-24 text-left">Variable</th>
        <th class="text-left">Value</th>
      </thead>
      <tbody>
        <tr>
          <td>Math.cos(degToRad(420))</td>
          <td>{{ Math.cos(degToRad(420)) }} (actual: 0.5)</td>
        </tr>
        <tr>
          <td>Math.sin(degToRad(420))</td>
          <td>{{ Math.sin(degToRad(420)) }} (actual: (sqrt(3) / 2) ~ 0.86602540)</td>
        </tr>
        <tr>
          <td>Tick</td>
          <td>{{ tickEndX }}, {{ tickEndY }}</td>
        </tr>
        <tr>
          <td>largeArch</td>
          <td>{{ largeArch }}</td>
        </tr>
        <tr>
          <td>sweep</td>
          <td>{{ sweep }}</td>
        </tr>
        <tr>
          <td>rim</td>
          <td>{{ rim }}</td>
        </tr>
        <tr>
          <td>valueArch</td>
          <td>{{ valueArch }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
