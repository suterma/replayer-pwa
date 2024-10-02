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

import {
    SubEvent,
    Subscription,
    type SubFunction,
    type ISubOptions,
} from 'sub-events';

/** @class Extends the @see {SubEvent} class with an additional subscription
 * overload that immediately provides a value, if available.
 */
export class SubEventImmediate<T> extends SubEvent<T> {
    /**
     * Subscribes to the event and immediately provides the last emitted event,
     * if there was any.
     *
     * When subscription is no longer needed, method {@link Subscription.cancel} should be called on the
     * returned object, to avoid performance degradation caused by abandoned subscribers.
     *
     * Method {@link SubEvent.getStat} can help with diagnosing leaked subscriptions.
     *
     * @param callback
     * Event notification callback function.
     *
     * @param options
     * Subscription Options.
     *
     * @returns
     * Object for cancelling the subscription safely.
     *
     * @see {@link once}
     */
    subscribeImmediate(
        callback: SubFunction<T>,
        options?: ISubOptions,
    ): Subscription {
        const subscription = super.subscribe(callback, options);
        const last = this.lastEvent;
        if (last !== undefined) {
            callback(last);
        }
        return subscription;
    }
}
