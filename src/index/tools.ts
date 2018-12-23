import { EventBus, Events } from "@app/index/eventBus";
import { Const } from "@app/index/const";

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

function isElementInPath(event: Event, id: string): boolean {
    // We need to use type any because Event hasn't property path, composedPath and composedPath().
    // Nevertheless, it's a cross browser way to get path.
    let path = (<any>event).path || ((<any>event).composedPath && (<any>event).composedPath());
    if (path === undefined || path.length === undefined) {
        return false;
    }

    for (let i = 0; i < path.length; i++) {
        if (path[i].id === id) {
            return true;
        }
    }

    return false;
}

export { isErrorStatusCode, isElementInPath, logError, logInfo, Const };
