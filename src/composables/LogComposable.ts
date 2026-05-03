import { Logger, type ILogObj, type ISettingsParam } from 'tslog';

let log: Logger<ILogObj> | undefined = undefined;

/** @remarks; A note about these settings:
 * Having the logger use the console, to have it handle the
 * log level correctly, does not work using the tslog logger.
 * To get a clickable source link in the browser's console,
 * no custom transport can be defined here.*/
const settings: ISettingsParam<ILogObj> | undefined = {
    name: 'replayer',
    hideLogPositionForProduction: true,
    prettyLogTemplate: '{{hh}}:{{MM}}:{{ss}}.{{ms}} {{logLevelName}}\t',
};

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
