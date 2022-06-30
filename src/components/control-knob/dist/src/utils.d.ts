export declare function degToRad(degrees: number): number;
export declare function leadingDebounce<A = unknown, R = void>(func: (args: A) => R, timeout?: number): (...args: A[]) => void;
export declare function changeToControlAngle(startValue: number, change: number, shiftModifier?: boolean): number;
export declare function controlAngleToValue(minValue: number, maxValue: number, controlAngle: number): number;
export declare function valueToControlAngle(minValue: number, maxValue: number, value: number): number;
