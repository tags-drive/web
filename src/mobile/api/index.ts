import { Params } from "@app/global";
import SharedStore from "@app/mobile/store";
import { IsErrorStatusCode } from "@app/global/utils";

function logError(msg: string | TypeError) {
    /* eslint-disable no-console */
    console.error(msg);
    /* eslint-enable no-console */
}

/**
 * returns share token if needed. Response is `"shareToken={token}"` or an empty string
 */
export const getShareTokenIfNeeded = (() => {
    let shareMode = false;
    let shareToken = "";

    // Detect share mode
    const res = /shareToken=([\w\d]+)/g.exec(location.search);
    if (res !== null && res[1] !== undefined) {
        shareMode = true;
        shareToken = res[1];
    }

    return (): string => {
        if (!shareMode) {
            return "";
        }

        return `shareToken=${shareToken}`;
    };
})();

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

    fetch(Params.Host + "/api/files?" + params + "&" + getShareTokenIfNeeded(), {
        method: "GET",
        credentials: "same-origin"
    })
        .then(resp => {
            if (resp.status === 204) {
                // No content (offset is out of bounds). All files were fetched
                SharedStore.commit("setAllFilesFetched");
                return;
            }
            if (IsErrorStatusCode(resp.status)) {
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
    // !WARNING!
    // This function doesn't work properly in Development Mode. Browser doesn't download files
    // when url points to a different domain (for example, "npm run serve" uses
    // "localhost:8080", but backend uses "localhost:80").

    const link = Params.Host + "/data/" + id + "?" + getShareTokenIfNeeded();

    let a = document.createElement("a");
    a.href = link;
    a.download = filename;
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function fetchTags() {
    fetch(Params.Host + "/api/tags?" + getShareTokenIfNeeded(), {
        method: "GET",
        credentials: "same-origin"
    })
        .then(resp => {
            if (IsErrorStatusCode(resp.status)) {
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

async function isUserAuthorized(): Promise<boolean> {
    let auth = false;

    await fetch(Params.Host + "/api/user", {
        method: "GET",
        credentials: "same-origin"
    })
        .then(resp => {
            if (IsErrorStatusCode(resp.status)) {
                auth = false;
                return;
            }
            return resp.json();
        })
        .then(user => {
            if (user !== undefined && user.authorized) {
                auth = true;
            }
        });

    return auth;
}

function logout() {
    fetch(Params.Host + "/api/logout", {
        method: "POST",
        credentials: "same-origin"
    })
        .then(resp => {
            if (IsErrorStatusCode(resp.status)) {
                resp.text().then(text => {
                    logError(text);
                });
                return;
            }

            window.location.reload();
        })
        .catch(err => logError(err));
}

export const API = {
    isUserAuthorized: isUserAuthorized,
    files: {
        fetch: fetchFiles,
        downloadSingleFile: downloadFile
    },
    tags: {
        fetch: fetchTags
    },
    logout: logout
};
