<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import {
  degToRad,
  leadingDebounce,
  changeToControlAngle,
  controlAngleToValue,
  valueToControlAngle,
} from '@/utils'
import { RADIUS, HALF_VIEWBOX, MIN_ANGLE, MAX_ANGLE } from '@/constants'

const knobElement = ref<HTMLElement>(0 as unknown as HTMLElement)
const controlAngle = ref(MIN_ANGLE)

interface Props {
  modelValue: number
  options?: {
    imageSize?: number
    minValue?: number
    maxValue?: number
    showTick?: boolean
    showValue?: boolean
    hideDefaultValue?: boolean
    tickLength?: number
    tickOffset?: number
    tickStroke?: number
    rimStroke?: number
    valueArchStroke?: number
    bgRadius?: number
    wheelFactor?: number
    keyFactor?: number
    tabIndex?: number
    ariaLabel?: string
    valueTextX?: number
    valueTextY?: number
    svgClass?: string
    bgClass?: string
    rimClass?: string
    valueArchClass?: string
    tickClass?: string
    valueTextClass?: string
    passiveEvents?: boolean
  }
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const vModel = computed<number>({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const imageSize = props.options?.imageSize || 40
const knobMinValue = props.options?.minValue || 0
const knobMaxValue = props.options?.maxValue || 100
const showTick = props.options?.showTick === undefined ? true : props.options?.showTick
const showValue = props.options?.showValue === undefined ? true : props.options?.showTick
const hideDefaultValue =
  props.options?.hideDefaultValue === undefined ? true : props.options?.hideDefaultValue
const tickLength = props.options?.tickLength || 18
const tickOffset = props.options?.tickOffset || 10
const tickStroke = props.options?.tickStroke || 3
const rimStroke = props.options?.rimStroke || 11
const valueArchStroke = props.options?.valueArchStroke || 11
const bgRadius = props.options?.bgRadius || 34
const wheelModifierFactor = props.options?.wheelFactor || 10
const keyModifierFactor = props.options?.keyFactor || 10
const tabIndex = props.options?.tabIndex || 0
const ariaLabel = props.options?.ariaLabel || 'Knob'
const valueTextX = props.options?.valueTextX || 50
const valueTextY = props.options?.valueTextY || 62
const svgClass = props.options?.svgClass || 'select-none'
const bgClass = props.options?.bgClass || 'text-[#868686]'
const rimClass = props.options?.rimClass || 'text-[#393939]'
const valueArchClass = props.options?.valueArchClass || 'text-[#53d769]'
const tickClass = props.options?.tickClass || 'text-black'
const valueTextClass =
  props.options?.valueTextClass || 'text-gray-50 text-[30px] font-normal font-mono'
const passiveEvents =
  props.options?.passiveEvents === undefined ? false : props.options?.passiveEvents

const startValue = vModel.value

const tickStartX = computed(() => {
  return HALF_VIEWBOX + Math.cos(degToRad(controlAngle.value)) * (RADIUS - tickLength)
})

const tickStartY = computed(() => {
  return HALF_VIEWBOX + Math.sin(degToRad(controlAngle.value)) * (RADIUS - tickLength)
})

const tickEndX = computed(() => {
  return HALF_VIEWBOX + Math.cos(degToRad(controlAngle.value)) * (RADIUS - tickOffset)
})

const tickEndY = computed(() => {
  return HALF_VIEWBOX + Math.sin(degToRad(controlAngle.value)) * (RADIUS - tickOffset)
})

const rimStartX = HALF_VIEWBOX + -0.5 * RADIUS
const rimStartY = HALF_VIEWBOX + Math.sin(degToRad(120)) * RADIUS
const rimEndX = HALF_VIEWBOX + 0.5 * RADIUS
const rimEndY = HALF_VIEWBOX + Math.sin(degToRad(420)) * RADIUS

const startRad = degToRad(120)
const currentValueRad = computed(() => degToRad(controlAngle.value))
const largeArch = computed(() => (Math.abs(startRad - currentValueRad.value) < Math.PI ? 0 : 1))
const sweep = ref(1)

const valueEndX = computed(() => 50 + Math.cos(degToRad(controlAngle.value)) * RADIUS)
const valueEndY = computed(() => 50 + Math.sin(degToRad(controlAngle.value)) * RADIUS)

const rim = `M ${rimStartX} ${rimStartY} A ${RADIUS} ${RADIUS} 0 1 1 ${rimEndX} ${rimEndY}`
const valueArch = computed(
  () =>
    `M ${rimStartX} ${rimStartY} A ${RADIUS} ${RADIUS} 0 ${largeArch.value} ${sweep.value} ${valueEndX.value} ${valueEndY.value}`
)

let prevY = 0
let currentY = 0
const mouseIsDown = ref(false)
const mouseIsOver = ref(false)
const mouseMoved = ref(false)
const hasFocus = ref(false)
const shiftModifier = ref(false)

const downListener = (event: MouseEvent | TouchEvent) => {
  mouseIsDown.value = true
  mouseMoved.value = false
  prevY = getEventY(event);
  preventScrolling(event);
}

 /** Gets the y coordinate associated with the event */
function getEventY(event: TouchEvent | MouseEvent): number {
  if (window.TouchEvent && event instanceof TouchEvent) {
    return event.touches[0].pageY;
  }
  else if (event instanceof MouseEvent) {
    return currentY = event.clientY
  }
  return 0;
}

function moveListener(event: TouchEvent | MouseEvent) {
  mouseMoved.value = true
  if (mouseIsDown.value) {
    currentY = getEventY(event);
    let direction: 'up' | 'down'
    const curYchange = prevY - currentY

    if (curYchange < 0) {
      direction = 'down'
    } else {
      direction = 'up'
    }

    if (
      prevY !== currentY &&
      ((direction === 'up' && controlAngle.value < MAX_ANGLE) ||
        (direction === 'down' && controlAngle.value > MIN_ANGLE))
    ) {
      const change = changeToControlAngle(prevY, curYchange, shiftModifier.value)

      if (controlAngle.value + change < MIN_ANGLE) {
        controlAngle.value = MIN_ANGLE
      } else if (controlAngle.value + change > MAX_ANGLE) {
        controlAngle.value = MAX_ANGLE
      } else {
        controlAngle.value += change
      }

      vModel.value = controlAngleToValue(knobMinValue, knobMaxValue, controlAngle.value)
    }
    prevY = currentY
  }
}

const debouncedMoveListener = leadingDebounce(moveListener)

/** According to the chosen option, prevents propagation of the event.
 * @remarks If set, keeps page from scrolling while handling the knob
 */
function preventScrolling(event: TouchEvent | MouseEvent | KeyboardEvent): void {
  if (passiveEvents === false) {
    event.preventDefault()
    event.stopPropagation()
  }
}

const upListener = () => {
  mouseIsDown.value = false
}

function resetValue() {
  controlAngle.value = MIN_ANGLE
}

function changeValue(change: number) {
  if (change > controlAngle.value) {
    if (change < MAX_ANGLE) {
      controlAngle.value = change
    } else {
      controlAngle.value = MAX_ANGLE
    }
  }

  if (change < controlAngle.value) {
    if (change < controlAngle.value && change > MIN_ANGLE) {
      controlAngle.value = change
    } else {
      controlAngle.value = MIN_ANGLE
    }
  }
  vModel.value = controlAngleToValue(knobMinValue, knobMaxValue, controlAngle.value)
}

function keyDownListener(event: KeyboardEvent) {
  //Update the shift modifier here already, otherwise the precise mode is not triggered properly
  if (event.key === 'Shift') {
    shiftModifier.value = true
  }

  if (hasFocus.value && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
    preventScrolling(event)
  }
}

function keyUpListener(event: KeyboardEvent) {
  if (event.key === 'Shift') {
    shiftModifier.value = false
  }

  let newValue: number
  const keyModifier = shiftModifier.value ? 1 : keyModifierFactor
  if (hasFocus.value && event.key === 'ArrowUp') {
    newValue = controlAngle.value + 1 * keyModifier
    changeValue(newValue)
  }

  if (hasFocus.value && event.key === 'ArrowDown') {
    newValue = controlAngle.value - 1 * keyModifier
    changeValue(newValue)
  }
}

function wheelListener(event: WheelEvent) {
  let newValue: number
  const wheelModifier = event.shiftKey ? 1 : wheelModifierFactor
  if ((!event.shiftKey && event.deltaY < 0) || (event.shiftKey && event.deltaX < 0)) {
    newValue = controlAngle.value + 1 * wheelModifier
  } else {
    newValue = controlAngle.value - 1 * wheelModifier
  }
  changeValue(newValue)
  preventScrolling(event)
}

function mouseOverHandler() {
  mouseIsOver.value = true
}

function mouseOutHandler() {
  mouseIsOver.value = false
}

watch(
  () => knobElement.value,
  (element, oldElement) => {
    if (element && !oldElement) {
      element.addEventListener('mousedown', downListener)
      element.addEventListener('touchstart', downListener, { passive: passiveEvents })
      element.addEventListener('wheel', wheelListener, { passive: passiveEvents })
      element.addEventListener('mouseenter', mouseOverHandler)
      element.addEventListener('mouseleave', mouseOutHandler)
      document.addEventListener('mouseup', upListener)
      document.addEventListener('touchend', upListener)
      document.addEventListener('mousemove', debouncedMoveListener)
      document.addEventListener('touchmove', debouncedMoveListener)
      document.addEventListener('keydown', keyDownListener)
      document.addEventListener('keyup', keyUpListener)

      const controlValue = valueToControlAngle(knobMinValue, knobMaxValue, props.modelValue)
      controlAngle.value = controlValue
    }
  }
)

watch(
  () => props.modelValue,
  (value) => {
    if (mouseIsOver.value === false && mouseIsDown.value === false && hasFocus.value === false) {
      // console.log('propvalue changed for ', knobElement.value.attributes.id)
      const controlValue = valueToControlAngle(knobMinValue, knobMaxValue, value)
      controlAngle.value = controlValue
    }
  }
)

onBeforeUnmount(() => {
  knobElement.value.removeEventListener('mousedown', downListener)
  knobElement.value.removeEventListener('touchstart', downListener)
  knobElement.value.removeEventListener('wheel', wheelListener)
  knobElement.value.removeEventListener('mouseenter', mouseOverHandler)
  knobElement.value.removeEventListener('mouseleave', mouseOutHandler)
  document.removeEventListener('mouseup', upListener)
  document.removeEventListener('touchend', upListener)
  document.removeEventListener('mousemove', debouncedMoveListener)
  document.removeEventListener('touchmove', debouncedMoveListener)
  document.removeEventListener('keydown', keyDownListener)
  document.removeEventListener('keyup', keyUpListener)
})
</script>
<template>
  <svg
    :width="imageSize"
    :height="imageSize"
    viewBox="0 0 100 100"
    ref="knobElement"
    role="slider"
    :aria-label="ariaLabel"
    :aria-valuemin="knobMinValue"
    :aria-valuemax="knobMaxValue"
    :aria-valuenow="vModel"
    :tabindex="tabIndex"
    :class="svgClass"
    @click.alt="resetValue"
    @focus="hasFocus = true"
    @blur="hasFocus = false"
  >
    <circle
      :cx="HALF_VIEWBOX"
      :cy="HALF_VIEWBOX"
      :r="bgRadius"
      stroke="currentColor"
      fill="currentColor"
      :class="bgClass"
      :stroke-width="1"
    />

    <path
      :d="rim"
      :stroke-width="rimStroke"
      stroke="currentColor"
      fill="none"
      :class="rimClass"
    ></path>

    <path
      v-if="controlAngle > 120"
      :d="valueArch"
      :stroke-width="valueArchStroke"
      stroke="currentColor"
      fill="none"
      :class="valueArchClass"
    ></path>

    <line
      v-if="showTick"
      :x1="tickStartX"
      :y1="tickStartY"
      :x2="tickEndX"
      :y2="tickEndY"
      stroke="currentColor"
      :stroke-width="tickStroke"
      :class="tickClass"
    />

    <text
      v-if="showValue && (!hideDefaultValue || startValue !== vModel)"
      :x="valueTextX"
      :y="valueTextY"
      text-anchor="middle"
      fill="currentColor"
      :class="valueTextClass"
    >
      {{ Math.ceil(vModel) }}
    </text>
  </svg>
</template>
