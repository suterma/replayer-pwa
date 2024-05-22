/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

// Taken from slipmatio /control-knob (MIT-Licensed)
export const RADIUS = 40;
export const IMAGE_VIEWBOX = 100;
export const HALF_VIEWBOX = IMAGE_VIEWBOX / 2;
/** The angle in [deg], representing the minimum value */
export const MIN_ANGLE = 120;
/** The angle in [deg], representing the maximum value */
export const MAX_ANGLE = 420;

/** A drag direction
 * */
export enum DragDirection {
    vertical = 'vertical',
    horizontal = 'horizontal',
}
