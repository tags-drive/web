import { Params } from "@app/global";
import SharedStore from "@app/mobile/store";
import { isErrorStatusCode } from "@app/global/utils";

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
 * @param resetFiles defines should function use "setFiles" (true) or "addFiles" (false) mutation in SharedStore
 */
function fetchFiles(
    expression: string,
    text: string,
    isRegexp: boolean,
    sType: string,
    sOrder: string,
    offset: number = 0,
    count: number = 0,
    resetFiles: boolean = true
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

    if (resetFiles) {
        SharedStore.commit("unsetAllFilesFetched");
    }

    fetch(Params.Host + "/api/files?" + params, {
        method: "GET",
        credentials: "same-origin"
    })
        .then(resp => {
            if (resp.status === 204) {
                // No content (offset is out of bounds). All files were fetched
                SharedStore.commit("setAllFilesFetched");
                return;
            }
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

            if (resetFiles) {
                SharedStore.commit("setFiles", files);
            } else {
                SharedStore.commit("addFiles", files);
            }
        })
        .catch(err => logError(err));
}

function downloadFile(id: number, filename: string) {
    fetch(Params.Host + "/data/" + id, {
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

            resp.blob().then(file => {
                let a = document.createElement("a"),
                    url = URL.createObjectURL(file);

                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();

                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            });
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
        fetch: fetchFiles,
        downloadSingleFile: downloadFile
    },
    tags: {
        fetch: fetchTags
    }
};
