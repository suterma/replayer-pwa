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

/** A logger for Replayer components */
const useLog = (settings?: ISettingsParam<ILogObj> | undefined) => {
    const log: Logger<ILogObj> = new Logger(settings);
    return {
        log,
    };
};

export default useLog;
