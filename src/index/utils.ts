import { EventBus, Events } from "@app/index/eventBus";
import { Const } from "@app/global/const";
import { Params } from "@app/global";

export function logError(msg: string | TypeError) {
    /* eslint-disable no-console */
    console.error(msg);
    /* eslint-enable no-console */

    if (
        msg instanceof TypeError &&
        (msg.message === "Failed to fetch" || // Chrome
            msg.message === "NetworkError when attempting to fetch resource.") // Firefox
    ) {
        msg = "Can't load data. Check network connection or server status.";
    }

    EventBus.$emit(Events.LogEvent, { type: Const.logType.error, msg: msg });
}

export function logInfo(msg: string) {
    /* eslint-disable no-console */
    console.info(msg);
    /* eslint-enable no-console */
    EventBus.$emit(Events.LogEvent, { type: Const.logType.info, msg: msg });
}

// urls are links without domain (/data/...)
export async function preloadImages(...urls: string[]) {
    for (let i = 0; i < urls.length; i++) {
        let img = new Image();
        img.src = Params.Host + "/" + urls[i];
    }
}
