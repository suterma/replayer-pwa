import { defineComponent, ref, computed, watch, onBeforeUnmount, openBlock, createElementBlock, unref, normalizeClass, withModifiers, createElementVNode, createCommentVNode, toDisplayString } from "vue";
const RADIUS = 40;
const IMAGE_VIEWBOX = 100;
const HALF_VIEWBOX = IMAGE_VIEWBOX / 2;
const MIN_ANGLE = 120;
const MAX_ANGLE = 420;
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}
function leadingDebounce(func, timeout = 13) {
  let timer;
  return (...args) => {
    if (!timer) {
      func.apply(this, args);
    } else {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = void 0;
    }, timeout);
  };
}
function changeToControlAngle(startValue, change, shiftModifier = false) {
  let controlYrange = 150;
  if (shiftModifier) {
    controlYrange = controlYrange * 10;
  }
  const controlRange = MAX_ANGLE - MIN_ANGLE;
  const pixelChange = controlRange / controlYrange;
  const controlAngleChange = change * pixelChange;
  return controlAngleChange;
}
function controlAngleToValue(minValue, maxValue, controlAngle) {
  let controlPercentage;
  const controlRange = MAX_ANGLE - MIN_ANGLE;
  const valueRange = maxValue - minValue;
  if (controlAngle === MIN_ANGLE) {
    controlPercentage = 0;
  } else if (controlAngle === MAX_ANGLE) {
    controlPercentage = 1;
  } else {
    controlPercentage = (controlAngle - MIN_ANGLE) / controlRange;
  }
  return minValue + valueRange * controlPercentage;
}
function valueToControlAngle(minValue, maxValue, value) {
  let valuePercentage;
  const controlRange = MAX_ANGLE - MIN_ANGLE;
  const valueRange = maxValue - minValue;
  if (value === minValue) {
    valuePercentage = 0;
  } else if (value === maxValue) {
    valuePercentage = 1;
  } else {
    valuePercentage = (value - minValue) / valueRange;
  }
  return MIN_ANGLE + controlRange * valuePercentage;
}
const _hoisted_1 = ["width", "height", "aria-label", "aria-valuemin", "aria-valuemax", "aria-valuenow", "tabindex", "onClick"];
const _hoisted_2 = ["cx", "cy", "r"];
const _hoisted_3 = ["stroke-width"];
const _hoisted_4 = ["d", "stroke-width"];
const _hoisted_5 = ["x1", "y1", "x2", "y2", "stroke-width"];
const _hoisted_6 = ["x", "y"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  props: {
    modelValue: null,
    options: null
  },
  emits: ["update:modelValue"],
  setup(__props, { emit }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C;
    const props = __props;
    const knobElement = ref(0);
    const controlAngle = ref(MIN_ANGLE);
    const vModel = computed({
      get() {
        return props.modelValue;
      },
      set(value) {
        emit("update:modelValue", value);
      }
    });
    const imageSize = ((_a = props.options) == null ? void 0 : _a.imageSize) || 40;
    const knobMinValue = ((_b = props.options) == null ? void 0 : _b.minValue) || 0;
    const knobMaxValue = ((_c = props.options) == null ? void 0 : _c.maxValue) || 100;
    const showTick = ((_d = props.options) == null ? void 0 : _d.showTick) === void 0 ? true : (_e = props.options) == null ? void 0 : _e.showTick;
    const showValue = ((_f = props.options) == null ? void 0 : _f.showValue) === void 0 ? true : (_g = props.options) == null ? void 0 : _g.showTick;
    const hideDefaultValue = ((_h = props.options) == null ? void 0 : _h.hideDefaultValue) === void 0 ? true : (_i = props.options) == null ? void 0 : _i.hideDefaultValue;
    const tickLength = ((_j = props.options) == null ? void 0 : _j.tickLength) || 18;
    const tickOffset = ((_k = props.options) == null ? void 0 : _k.tickOffset) || 10;
    const tickStroke = ((_l = props.options) == null ? void 0 : _l.tickStroke) || 3;
    const rimStroke = ((_m = props.options) == null ? void 0 : _m.rimStroke) || 11;
    const valueArchStroke = ((_n = props.options) == null ? void 0 : _n.valueArchStroke) || 11;
    const bgRadius = ((_o = props.options) == null ? void 0 : _o.bgRadius) || 34;
    const wheelModifierFactor = ((_p = props.options) == null ? void 0 : _p.wheelFactor) || 10;
    const keyModifierFactor = ((_q = props.options) == null ? void 0 : _q.keyFactor) || 10;
    const tabIndex = ((_r = props.options) == null ? void 0 : _r.tabIndex) || 0;
    const ariaLabel = ((_s = props.options) == null ? void 0 : _s.ariaLabel) || "Knob";
    const valueTextX = ((_t = props.options) == null ? void 0 : _t.valueTextX) || 50;
    const valueTextY = ((_u = props.options) == null ? void 0 : _u.valueTextY) || 62;
    const svgClass = ((_v = props.options) == null ? void 0 : _v.svgClass) || "select-none";
    const bgClass = ((_w = props.options) == null ? void 0 : _w.bgClass) || "text-[#868686]";
    const rimClass = ((_x = props.options) == null ? void 0 : _x.rimClass) || "text-[#393939]";
    const valueArchClass = ((_y = props.options) == null ? void 0 : _y.valueArchClass) || "text-[#53d769]";
    const tickClass = ((_z = props.options) == null ? void 0 : _z.tickClass) || "text-black";
    const valueTextClass = ((_A = props.options) == null ? void 0 : _A.valueTextClass) || "text-gray-50 text-[30px] font-normal font-mono";
    const passiveEvents = ((_B = props.options) == null ? void 0 : _B.passiveEvents) === void 0 ? false : (_C = props.options) == null ? void 0 : _C.passiveEvents;
    const startValue = vModel.value;
    const tickStartX = computed(() => {
      return HALF_VIEWBOX + Math.cos(degToRad(controlAngle.value)) * (RADIUS - tickLength);
    });
    const tickStartY = computed(() => {
      return HALF_VIEWBOX + Math.sin(degToRad(controlAngle.value)) * (RADIUS - tickLength);
    });
    const tickEndX = computed(() => {
      return HALF_VIEWBOX + Math.cos(degToRad(controlAngle.value)) * (RADIUS - tickOffset);
    });
    const tickEndY = computed(() => {
      return HALF_VIEWBOX + Math.sin(degToRad(controlAngle.value)) * (RADIUS - tickOffset);
    });
    const rimStartX = HALF_VIEWBOX + -0.5 * RADIUS;
    const rimStartY = HALF_VIEWBOX + Math.sin(degToRad(120)) * RADIUS;
    const rimEndX = HALF_VIEWBOX + 0.5 * RADIUS;
    const rimEndY = HALF_VIEWBOX + Math.sin(degToRad(420)) * RADIUS;
    const startRad = degToRad(120);
    const currentValueRad = computed(() => degToRad(controlAngle.value));
    const largeArch = computed(() => Math.abs(startRad - currentValueRad.value) < Math.PI ? 0 : 1);
    const sweep = ref(1);
    const valueEndX = computed(() => 50 + Math.cos(degToRad(controlAngle.value)) * RADIUS);
    const valueEndY = computed(() => 50 + Math.sin(degToRad(controlAngle.value)) * RADIUS);
    const rim = `M ${rimStartX} ${rimStartY} A ${RADIUS} ${RADIUS} 0 1 1 ${rimEndX} ${rimEndY}`;
    const valueArch = computed(() => `M ${rimStartX} ${rimStartY} A ${RADIUS} ${RADIUS} 0 ${largeArch.value} ${sweep.value} ${valueEndX.value} ${valueEndY.value}`);
    let prevY = 0;
    let currentY = 0;
    const mouseIsDown = ref(false);
    const mouseIsOver = ref(false);
    const mouseMoved = ref(false);
    const hasFocus = ref(false);
    const shiftModifier = ref(false);
    const downListener = (event) => {
      mouseIsDown.value = true;
      mouseMoved.value = false;
      prevY = getEventY(event);
      preventScrolling(event);
    };
    function getEventY(event) {
      if (window.TouchEvent && event instanceof TouchEvent) {
        return event.touches[0].pageY;
      } else if (event instanceof MouseEvent) {
        return currentY = event.clientY;
      }
      return 0;
    }
    function moveListener(event) {
      mouseMoved.value = true;
      if (mouseIsDown.value) {
        currentY = getEventY(event);
        let direction;
        const curYchange = prevY - currentY;
        if (curYchange < 0) {
          direction = "down";
        } else {
          direction = "up";
        }
        if (prevY !== currentY && (direction === "up" && controlAngle.value < MAX_ANGLE || direction === "down" && controlAngle.value > MIN_ANGLE)) {
          const change = changeToControlAngle(prevY, curYchange, shiftModifier.value);
          if (controlAngle.value + change < MIN_ANGLE) {
            controlAngle.value = MIN_ANGLE;
          } else if (controlAngle.value + change > MAX_ANGLE) {
            controlAngle.value = MAX_ANGLE;
          } else {
            controlAngle.value += change;
          }
          vModel.value = controlAngleToValue(knobMinValue, knobMaxValue, controlAngle.value);
        }
        prevY = currentY;
      }
    }
    const debouncedMoveListener = leadingDebounce(moveListener);
    function preventScrolling(event) {
      if (passiveEvents === false) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    const upListener = () => {
      mouseIsDown.value = false;
    };
    function resetValue() {
      controlAngle.value = MIN_ANGLE;
    }
    function changeValue(change) {
      if (change > controlAngle.value) {
        if (change < MAX_ANGLE) {
          controlAngle.value = change;
        } else {
          controlAngle.value = MAX_ANGLE;
        }
      }
      if (change < controlAngle.value) {
        if (change < controlAngle.value && change > MIN_ANGLE) {
          controlAngle.value = change;
        } else {
          controlAngle.value = MIN_ANGLE;
        }
      }
      vModel.value = controlAngleToValue(knobMinValue, knobMaxValue, controlAngle.value);
    }
    function keyDownListener(event) {
      if (event.key === "Shift") {
        shiftModifier.value = true;
      }
      if (hasFocus.value && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
        preventScrolling(event);
      }
    }
    function keyUpListener(event) {
      if (event.key === "Shift") {
        shiftModifier.value = false;
      }
      let newValue;
      const keyModifier = shiftModifier.value ? 1 : keyModifierFactor;
      if (hasFocus.value && event.key === "ArrowUp") {
        newValue = controlAngle.value + 1 * keyModifier;
        changeValue(newValue);
      }
      if (hasFocus.value && event.key === "ArrowDown") {
        newValue = controlAngle.value - 1 * keyModifier;
        changeValue(newValue);
      }
    }
    function wheelListener(event) {
      let newValue;
      const wheelModifier = event.shiftKey ? 1 : wheelModifierFactor;
      if (!event.shiftKey && event.deltaY < 0 || event.shiftKey && event.deltaX < 0) {
        newValue = controlAngle.value + 1 * wheelModifier;
      } else {
        newValue = controlAngle.value - 1 * wheelModifier;
      }
      changeValue(newValue);
      preventScrolling(event);
    }
    function mouseOverHandler() {
      mouseIsOver.value = true;
    }
    function mouseOutHandler() {
      mouseIsOver.value = false;
    }
    watch(() => knobElement.value, (element, oldElement) => {
      if (element && !oldElement) {
        element.addEventListener("mousedown", downListener);
        element.addEventListener("touchstart", downListener, { passive: passiveEvents });
        element.addEventListener("wheel", wheelListener, { passive: passiveEvents });
        element.addEventListener("mouseenter", mouseOverHandler);
        element.addEventListener("mouseleave", mouseOutHandler);
        document.addEventListener("mouseup", upListener);
        document.addEventListener("touchend", upListener);
        document.addEventListener("mousemove", debouncedMoveListener);
        document.addEventListener("touchmove", debouncedMoveListener);
        document.addEventListener("keydown", keyDownListener);
        document.addEventListener("keyup", keyUpListener);
        const controlValue = valueToControlAngle(knobMinValue, knobMaxValue, props.modelValue);
        controlAngle.value = controlValue;
      }
    });
    watch(() => props.modelValue, (value) => {
      if (mouseIsOver.value === false && mouseIsDown.value === false && hasFocus.value === false) {
        const controlValue = valueToControlAngle(knobMinValue, knobMaxValue, value);
        controlAngle.value = controlValue;
      }
    });
    onBeforeUnmount(() => {
      knobElement.value.removeEventListener("mousedown", downListener);
      knobElement.value.removeEventListener("touchstart", downListener);
      knobElement.value.removeEventListener("wheel", wheelListener);
      knobElement.value.removeEventListener("mouseenter", mouseOverHandler);
      knobElement.value.removeEventListener("mouseleave", mouseOutHandler);
      document.removeEventListener("mouseup", upListener);
      document.removeEventListener("touchend", upListener);
      document.removeEventListener("mousemove", debouncedMoveListener);
      document.removeEventListener("touchmove", debouncedMoveListener);
      document.removeEventListener("keydown", keyDownListener);
      document.removeEventListener("keyup", keyUpListener);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("svg", {
        width: unref(imageSize),
        height: unref(imageSize),
        viewBox: "0 0 100 100",
        ref_key: "knobElement",
        ref: knobElement,
        role: "slider",
        "aria-label": unref(ariaLabel),
        "aria-valuemin": unref(knobMinValue),
        "aria-valuemax": unref(knobMaxValue),
        "aria-valuenow": unref(vModel),
        tabindex: unref(tabIndex),
        class: normalizeClass(unref(svgClass)),
        onClick: withModifiers(resetValue, ["alt"]),
        onFocus: _cache[0] || (_cache[0] = ($event) => hasFocus.value = true),
        onBlur: _cache[1] || (_cache[1] = ($event) => hasFocus.value = false)
      }, [
        createElementVNode("circle", {
          cx: unref(HALF_VIEWBOX),
          cy: unref(HALF_VIEWBOX),
          r: unref(bgRadius),
          stroke: "currentColor",
          fill: "currentColor",
          class: normalizeClass(unref(bgClass)),
          "stroke-width": 1
        }, null, 10, _hoisted_2),
        createElementVNode("path", {
          d: rim,
          "stroke-width": unref(rimStroke),
          stroke: "currentColor",
          fill: "none",
          class: normalizeClass(unref(rimClass))
        }, null, 10, _hoisted_3),
        controlAngle.value > 120 ? (openBlock(), createElementBlock("path", {
          key: 0,
          d: unref(valueArch),
          "stroke-width": unref(valueArchStroke),
          stroke: "currentColor",
          fill: "none",
          class: normalizeClass(unref(valueArchClass))
        }, null, 10, _hoisted_4)) : createCommentVNode("", true),
        unref(showTick) ? (openBlock(), createElementBlock("line", {
          key: 1,
          x1: unref(tickStartX),
          y1: unref(tickStartY),
          x2: unref(tickEndX),
          y2: unref(tickEndY),
          stroke: "currentColor",
          "stroke-width": unref(tickStroke),
          class: normalizeClass(unref(tickClass))
        }, null, 10, _hoisted_5)) : createCommentVNode("", true),
        unref(showValue) && (!unref(hideDefaultValue) || unref(startValue) !== unref(vModel)) ? (openBlock(), createElementBlock("text", {
          key: 2,
          x: unref(valueTextX),
          y: unref(valueTextY),
          "text-anchor": "middle",
          fill: "currentColor",
          class: normalizeClass(unref(valueTextClass))
        }, toDisplayString(Math.ceil(unref(vModel))), 11, _hoisted_6)) : createCommentVNode("", true)
      ], 42, _hoisted_1);
    };
  }
});
export { _sfc_main as default };
//# sourceMappingURL=index.es.js.map
