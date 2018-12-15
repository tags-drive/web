import { EventBus, Events } from "./eventBus";
import { Const } from "./const";

function isErrorStatusCode(code: number): boolean {
    return code >= 400;
}

function logError(msg: string) {
    /* eslint-disable no-console */
    console.error(msg);
    /* eslint-enable no-console */
    EventBus.$emit(Events.LogEvent, { type: Const.logType.error, msg: msg });
}

function logInfo(msg: string) {
    /* eslint-disable no-console */
    console.info(msg);
    /* eslint-enable no-console */
    EventBus.$emit(Events.LogEvent, { type: Const.logType.info, msg: msg });
}

export { isErrorStatusCode, logError, logInfo, Const };
