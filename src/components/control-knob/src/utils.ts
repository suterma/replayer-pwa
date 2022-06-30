import { MIN_ANGLE, MAX_ANGLE } from '@/constants'

export function degToRad(degrees: number) {
  return (degrees * Math.PI) / 180
}

export function leadingDebounce<A = unknown, R = void>(func: (args: A) => R, timeout = 13) {
  let timer: NodeJS.Timeout | undefined
  return (...args: A[]) => {
    if (!timer) {
      // @ts-expect-error FIXME: couldn't figure this one out!
      func.apply(this, args)
    } else {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      timer = undefined
    }, timeout)
  }
}

export function changeToControlAngle(startValue: number, change: number, shiftModifier = false) {
  let controlYrange = 150
  if (shiftModifier) {
    controlYrange = controlYrange * 10
  }
  const controlRange = MAX_ANGLE - MIN_ANGLE
  const pixelChange = controlRange / controlYrange
  const controlAngleChange = change * pixelChange

  return controlAngleChange
}

export function controlAngleToValue(minValue: number, maxValue: number, controlAngle: number) {
  let controlPercentage: number
  const controlRange = MAX_ANGLE - MIN_ANGLE
  const valueRange = maxValue - minValue
  if (controlAngle === MIN_ANGLE) {
    controlPercentage = 0
  } else if (controlAngle === MAX_ANGLE) {
    controlPercentage = 1
  } else {
    controlPercentage = (controlAngle - MIN_ANGLE) / controlRange
  }
  return minValue + valueRange * controlPercentage
}

export function valueToControlAngle(minValue: number, maxValue: number, value: number) {
  let valuePercentage: number
  const controlRange = MAX_ANGLE - MIN_ANGLE
  const valueRange = maxValue - minValue

  if (value === minValue) {
    valuePercentage = 0
  } else if (value === maxValue) {
    valuePercentage = 1
  } else {
    valuePercentage = (value - minValue) / valueRange
  }
  return MIN_ANGLE + controlRange * valuePercentage
}
