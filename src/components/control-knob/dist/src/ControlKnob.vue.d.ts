import type { DefineComponent, Ref, WritableComputedRef, ComputedRef, ComponentOptionsMixin, VNodeProps, AllowedComponentProps, ComponentCustomProps, ExtractPropTypes } from 'vue';
declare const _sfc_main: DefineComponent<{
    modelValue: {
        type: NumberConstructor;
        required: true;
    };
    options: {
        type: ObjectConstructor;
        required: false;
    };
}, {
    knobElement: Ref<HTMLElement>;
    controlAngle: Ref<number>;
    props: {
        modelValue: number;
        options?: {
            imageSize?: number | undefined;
            minValue?: number | undefined;
            maxValue?: number | undefined;
            showTick?: boolean | undefined;
            showValue?: boolean | undefined;
            hideDefaultValue?: boolean | undefined;
            tickLength?: number | undefined;
            tickOffset?: number | undefined;
            tickStroke?: number | undefined;
            rimStroke?: number | undefined;
            valueArchStroke?: number | undefined;
            bgRadius?: number | undefined;
            wheelFactor?: number | undefined;
            keyFactor?: number | undefined;
            tabIndex?: number | undefined;
            ariaLabel?: string | undefined;
            valueTextX?: number | undefined;
            valueTextY?: number | undefined;
            svgClass?: string | undefined;
            bgClass?: string | undefined;
            rimClass?: string | undefined;
            valueArchClass?: string | undefined;
            tickClass?: string | undefined;
            valueTextClass?: string | undefined;
            passiveEvents?: boolean | undefined;
        } | undefined;
    };
    emit: (event: "update:modelValue", ...args: any[]) => void;
    vModel: WritableComputedRef<number>;
    imageSize: number;
    knobMinValue: number;
    knobMaxValue: number;
    showTick: boolean;
    showValue: boolean | undefined;
    hideDefaultValue: boolean;
    tickLength: number;
    tickOffset: number;
    tickStroke: number;
    rimStroke: number;
    valueArchStroke: number;
    bgRadius: number;
    wheelModifierFactor: number;
    keyModifierFactor: number;
    tabIndex: number;
    ariaLabel: string;
    valueTextX: number;
    valueTextY: number;
    svgClass: string;
    bgClass: string;
    rimClass: string;
    valueArchClass: string;
    tickClass: string;
    valueTextClass: string;
    passiveEvents: boolean;
    startValue: number;
    tickStartX: ComputedRef<number>;
    tickStartY: ComputedRef<number>;
    tickEndX: ComputedRef<number>;
    tickEndY: ComputedRef<number>;
    rimStartX: number;
    rimStartY: number;
    rimEndX: number;
    rimEndY: number;
    startRad: number;
    currentValueRad: ComputedRef<number>;
    largeArch: ComputedRef<0 | 1>;
    sweep: Ref<number>;
    valueEndX: ComputedRef<number>;
    valueEndY: ComputedRef<number>;
    rim: string;
    valueArch: ComputedRef<string>;
    prevY: number;
    currentY: number;
    mouseIsDown: Ref<boolean>;
    mouseIsOver: Ref<boolean>;
    mouseMoved: Ref<boolean>;
    hasFocus: Ref<boolean>;
    shiftModifier: Ref<boolean>;
    downListener: (event: MouseEvent | TouchEvent) => void;
    getEventY: (event: TouchEvent | MouseEvent) => number;
    moveListener: (event: TouchEvent | MouseEvent) => void;
    debouncedMoveListener: (...args: (MouseEvent | TouchEvent)[]) => void;
    preventScrolling: (event: TouchEvent | MouseEvent | KeyboardEvent) => void;
    upListener: () => void;
    resetValue: () => void;
    changeValue: (change: number) => void;
    keyDownListener: (event: KeyboardEvent) => void;
    keyUpListener: (event: KeyboardEvent) => void;
    wheelListener: (event: WheelEvent) => void;
    mouseOverHandler: () => void;
    mouseOutHandler: () => void;
    HALF_VIEWBOX: number;
}, unknown, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, "update:modelValue"[], "update:modelValue", VNodeProps & AllowedComponentProps & ComponentCustomProps, Readonly<ExtractPropTypes<{
    modelValue: {
        type: NumberConstructor;
        required: true;
    };
    options: {
        type: ObjectConstructor;
        required: false;
    };
}>> & {
    "onUpdate:modelValue"?: ((...args: any[]) => any) | undefined;
}, {}>;
export default _sfc_main;