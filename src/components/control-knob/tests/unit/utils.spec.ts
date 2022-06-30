import { describe, it, beforeEach, afterEach, expect, test, vi } from 'vitest'
import {
  degToRad,
  leadingDebounce,
  changeToControlAngle,
  controlAngleToValue,
} from '../../src/utils'
import { MIN_ANGLE, MAX_ANGLE } from '../../src/constants'

const testfn = (a: number) => a + 1

test('degToRad', () => {
  expect(degToRad(0)).toEqual(0)
  expect(degToRad(90)).toEqual(Math.PI / 2)
  expect(degToRad(180)).toEqual(Math.PI)
  expect(degToRad(270)).toEqual(Math.PI * 1.5)
  expect(degToRad(360)).toEqual(Math.PI * 2)
})

describe('leadingDebounce', () => {
  let func = vi.fn()

  beforeEach(() => {
    func = vi.fn()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('debounces', () => {
    const mock = vi.fn().mockImplementation(testfn)
    const debouncedMock = leadingDebounce(func)

    mock(1)
    debouncedMock(1)

    expect(mock).toHaveBeenCalledTimes(1)
    expect(func).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 5; i++) {
      mock(1)
      debouncedMock()
    }

    // @ts-expect-error missing typings
    expect(mock.calls.length).toBe(6)
    // @ts-expect-error missing typings
    expect(func.calls.length).toBeLessThan(6)
  })
})

test('changeToControlAngle', () => {
  // up from minimum
  expect(changeToControlAngle(MIN_ANGLE, 0, false)).toEqual(0)
  expect(changeToControlAngle(MIN_ANGLE, 0, true)).toEqual(0)
  expect(changeToControlAngle(MIN_ANGLE, -10, false)).toEqual(-20)
  expect(changeToControlAngle(MIN_ANGLE, -10, true)).toEqual(-2)
  expect(changeToControlAngle(MIN_ANGLE, 10, false)).toEqual(20)
  expect(changeToControlAngle(MIN_ANGLE, 10, true)).toEqual(2)
  expect(changeToControlAngle(MIN_ANGLE, 200, false)).toEqual(400)
  expect(changeToControlAngle(MIN_ANGLE, 200, true)).toEqual(40)

  // dowm from maximum
  expect(changeToControlAngle(MAX_ANGLE, 0, false)).toEqual(0)
  expect(changeToControlAngle(MAX_ANGLE, 0, true)).toEqual(0)
  expect(changeToControlAngle(MAX_ANGLE, 10, false)).toEqual(20)
  expect(changeToControlAngle(MAX_ANGLE, 10, true)).toEqual(2)
  expect(changeToControlAngle(MAX_ANGLE, -10, false)).toEqual(-20)
  expect(changeToControlAngle(MAX_ANGLE, -10, true)).toEqual(-2)
  expect(changeToControlAngle(MAX_ANGLE, -200, false)).toEqual(-400)
  expect(changeToControlAngle(MAX_ANGLE, -200, true)).toEqual(-40)

  // misc changes
  expect(changeToControlAngle(200, 0, false)).toEqual(0)
  expect(changeToControlAngle(200, 0, true)).toEqual(0)
  expect(changeToControlAngle(200, 30, false)).toEqual(60)
  expect(changeToControlAngle(200, 30, true)).toEqual(6)
  expect(changeToControlAngle(200, -30, false)).toEqual(-60)
  expect(changeToControlAngle(200, -30, true)).toEqual(-6)
})

test('controlAngleToValue', () => {
  // 0-100
  expect(controlAngleToValue(0, 100, 120)).toEqual(0)
  expect(controlAngleToValue(0, 100, 270)).toEqual(50)
  expect(controlAngleToValue(0, 100, 420)).toEqual(100)
  // -64-64
  expect(controlAngleToValue(-64, 64, 120)).toEqual(-64)
  expect(controlAngleToValue(-64, 64, 270)).toEqual(0)
  expect(controlAngleToValue(-64, 64, 420)).toEqual(64)
})
