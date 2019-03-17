import { Params } from "@app/global";
import SharedStore from "@app/mobile/store";

function isErrorStatusCode(code: number): boolean {
    return code >= 400;
}

function logError(msg: string | TypeError) {
    /* eslint-disable no-console */
    console.error(msg);
    /* eslint-enable no-console */
}

/**
 * fetches all files and update Store
 *
 * @param expression logical expression
 * @param text test to search
 * @param isRegexp is text a regular expression
 * @param sType sort type (use "" to search with default value)
 * @param sOrder sort order (use "" to search with default value)
 * @param offset
 * @param count number of returned files (if count == 0, all files will be returned)
 */
function fetchFiles(
    expression: string,
    text: string,
    isRegexp: boolean,
    sType: string,
    sOrder: string,
    offset: number = 0,
    count: number = 0
) {
    let params = new URLSearchParams();
    // Expression
    if (expression !== "") {
        params.append("expr", expression);
    }
    if (text !== "") {
        params.append("search", text);
    }
    if (isRegexp) {
        params.append("regexp", "true");
    }
    if (sType !== "") {
        params.append("sort", sType);
    }
    if (sOrder !== "") {
        params.append("order", sOrder);
    }
    if (offset !== 0) {
        params.append("offset", String(offset));
    }
    if (count !== 0) {
        params.append("count", String(count));
    }

    fetch(Params.Host + "/api/files?" + params, {
        method: "GET",
        credentials: "same-origin"
    })
        .then(resp => {
            if (isErrorStatusCode(resp.status)) {
                resp.text().then(text => {
                    logError(text);
                });
                return;
            }
            return resp.json();
        })
        .then(files => {
            if (files === undefined) {
                return;
            }

            SharedStore.commit("setFiles", files);
        })
        .catch(err => logError(err));
}

function fetchTags() {
    fetch(Params.Host + "/api/tags", {
        method: "GET",
        credentials: "same-origin"
    })
        .then(resp => {
            if (isErrorStatusCode(resp.status)) {
                resp.text().then(text => {
                    logError(text);
                });
                return;
            }
            return resp.json();
        })
        .then(tags => {
            if (tags === undefined) {
                return;
            }

            SharedStore.commit("setTags", tags);
        })
        .catch(err => logError(err));
}

export const API = {
    files: {
        fetch: fetchFiles
    },
    tags: {
        fetch: fetchTags
    }
};
