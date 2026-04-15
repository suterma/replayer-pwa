import { Logger, type ILogObj, type ISettingsParam } from 'tslog';

let log: Logger<ILogObj> | undefined = undefined;

const settings: ISettingsParam<ILogObj> | undefined = {
    hideLogPositionForProduction: true,
    prettyLogTemplate: '{{logLevelName}}\t[{{filePathWithLine}}{{name}}]\t',
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
