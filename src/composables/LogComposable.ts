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

import { Logger, type ILogObj, type ISettingsParam } from 'tslog';

let log: Logger<ILogObj> | undefined = undefined;

const settings: ISettingsParam<ILogObj> | undefined = {};

/** An application global logger instance for Replayer */
const useLog = () => {
    if (log == undefined) {
        log = new Logger(settings);
        log.debug('Logger created');
    }
    return {
        log,
    };
};

export default useLog;
