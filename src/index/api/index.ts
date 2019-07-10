import { Params } from "@app/global";
import { Const } from "@app/global/const";
import { EventBus, Events } from "@app/index/eventBus";
import { logError, logInfo } from "@app/index/utils";
import { IsErrorStatusCode } from "@app/global/utils";
import SharedStore from "@app/index/store";
import SharedState from "@app/index/state";

/**
 * returns share token if needed. Response is `"shareToken={token}"` or an empty string
 */
function getShareTokenIfNeeded(): string {
    if (!SharedState.state.shareMode) {
        return "";
    }

    return `shareToken=${SharedState.state.shareToken}`;
}

// User

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

// Files

/**
 * fetches single file and update Store
 *
 * @param id id of a file
 */
function fetchFile(id: number) {
    fetch(Params.Host + `/api/file/${id}?` + getShareTokenIfNeeded(), {
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
        .then(file => {
            if (file === undefined) {
                return;
            }

            SharedStore.commit("setSingleFiles", file);
        })
        .catch(err => logError(err));
}

/**
 * fetches all files and update Store
 *
 * @param expression logical expression
 * @param text test to search
 * @param isRegexp is text a regular expression
 * @param sType sort type
 * @param sOrder sort order
 */
function fetchFiles(expression: string, text: string, isRegexp: boolean, sType?: string, sOrder?: string) {
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
    if (sType !== undefined && sType !== "") {
        params.append("sort", sType);
    }
    if (sOrder !== undefined && sOrder !== "") {
        params.append("order", sOrder);
    }

    fetch(Params.Host + "/api/files?" + params + "&" + getShareTokenIfNeeded(), {
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
        .then(files => {
            if (files === undefined) {
                return;
            }

            SharedStore.commit("setFiles", files);
        })
        .catch(err => logError(err));
}

function downloadFile(id: number, filename: string) {
    fetch(Params.Host + "/data/" + id + "?" + getShareTokenIfNeeded(), {
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

function downloadFiles(ids: number[]) {
    let params = new URLSearchParams();
    params.append("ids", ids.join(","));

    fetch(Params.Host + "/api/files/download?" + params + "&" + getShareTokenIfNeeded(), {
        method: "GET",
        credentials: "same-origin"
    }).then(resp => {
        resp.blob().then(file => {
            let a = document.createElement("a"),
                url = URL.createObjectURL(file);

            a.href = url;
            a.download = "files.zip";
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        });
    });
}

function changeFileName(id: number, newName: string) {
    let params = new URLSearchParams();
    params.append("new-name", newName);

    fetch(Params.Host + `/api/file/${id}/name?` + params, {
        method: "PUT",
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
        .then(file => {
            SharedStore.commit("setSingleFiles", file);
        })
        .catch(err => {
            logError(err);
        });
}

function changeFileDescription(id: number, newDesc: string) {
    let params = new URLSearchParams();
    params.append("description", newDesc);

    fetch(Params.Host + `/api/file/${id}/description?` + params, {
        method: "PUT",
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
        .then(file => {
            SharedStore.commit("setSingleFiles", file);
        })
        .catch(err => {
            logError(err);
        });
}

function changeFileTags(id: number, newTagsIDs: number[]) {
    let params = new URLSearchParams();
    params.append("tags", newTagsIDs.join(","));

    fetch(Params.Host + `/api/file/${id}/tags?` + params, {
        method: "PUT",
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
        .then(file => {
            SharedStore.commit("setSingleFiles", file);
        })
        .catch(err => {
            logError(err);
        });
}

function changeFilesTags(filesIDs: number[], tagsIDs: number[], mode: string) {
    let method = "POST";
    if (mode === Const.tagsChanging.deleteMode) {
        method = "DELETE";
    }

    let params = new URLSearchParams();
    params.append("files", filesIDs.join(","));
    params.append("tags", tagsIDs.join(","));

    fetch(Params.Host + `/api/files/tags?` + params, {
        method: method
    })
        .then(resp => {
            if (IsErrorStatusCode(resp.status)) {
                resp.text().then(text => {
                    logError(text);
                });

                return;
            }

            EventBus.$emit(Events.FilesBlock.UnselectAllFiles);
            EventBus.$emit(Events.Search.Usual);
        })
        .catch(err => logError(err));
}

function recoverFiles(ids: number[]) {
    let params = new URLSearchParams();
    params.append("ids", ids.join(","));

    fetch(Params.Host + "/api/files/recover?" + params, {
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

            // Refresh list of files
            EventBus.$emit(Events.Search.Usual);
        })
        .then(() => logInfo("File was recovered"))
        .catch(err => logError(err));
}

function deleteFiles(ids: number[], force: boolean) {
    let params = new URLSearchParams();
    params.append("ids", ids.join(","));
    if (force) {
        params.append("force", "true");
    }

    fetch(Params.Host + "/api/files?" + params, {
        method: "DELETE",
        credentials: "same-origin"
    })
        .then(resp => {
            if (IsErrorStatusCode(resp.status)) {
                resp.text().then(text => {
                    logError(text);
                });
                return;
            }

            // Refresh list of files
            EventBus.$emit(Events.Search.Usual);
            return resp.json();
        })
        .then(log => {
            if (log === undefined) {
                return;
            }
            /* Schema:
			[
				{
					filename: string,
					isError: boolean,
					error: string (when isError == true),
					status: string (when isError == false)
				}
			]
			*/
            for (let i in log) {
                let msg = log[i].filename;
                if (log[i].isError) {
                    msg += " " + log[i].error;
                } else {
                    msg += " " + log[i].status;
                }

                if (log[i].isError) {
                    logError(msg);
                } else {
                    logInfo(msg);
                }
            }
        })
        .catch(err => logError(err));
}

function shareFiles(...ids: number[]) {
    let params = new URLSearchParams();
    params.append("ids", ids.join(","));

    fetch(Params.Host + "/api/share/token?" + params, {
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

            return resp.json();
        })
        .then(jsonResp => {
            if (jsonResp === undefined || jsonResp.token === undefined) {
                logError("Can't share files (invalid response)");
                return;
            }

            let link = location.origin + "/share?shareToken=" + jsonResp.token;

            logInfo(`Use <a href="${link}" target="_blank">this link</a> to view shared files`, false);
        });
}

// Tags

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

function addTag(name: string, color: string, group?: string) {
    let params = new URLSearchParams();
    params.append("name", name);
    params.append("color", color);
    if (group !== undefined) {
        params.append("group", group);
    }

    fetch(Params.Host + "/api/tags?" + params, {
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

            // update Tags
            fetchTags();
        })
        .catch(err => {
            logError(err);
        });
}

function changeTag(tagID: number, newName: string, newColor: string, newGroup?: string) {
    let params = new URLSearchParams();
    params.append("name", newName);
    params.append("color", newColor);
    if (newGroup !== undefined) {
        params.append("group", newGroup);
    }

    fetch(Params.Host + `/api/tag/${tagID}?` + params, {
        method: "PUT",
        credentials: "same-origin"
    })
        .then(resp => {
            if (IsErrorStatusCode(resp.status)) {
                resp.text().then(text => {
                    logError(text);
                });
                return;
            }

            // update Tags
            fetchTags();
        })
        .catch(err => {
            logError(err);
        });
}

function deleteTag(tagID: number) {
    let params = new URLSearchParams();
    params.append("id", String(tagID));

    fetch(Params.Host + "/api/tags?" + params, {
        method: "DELETE",
        credentials: "same-origin"
    })
        .then(resp => {
            if (IsErrorStatusCode(resp.status)) {
                resp.text().then(text => {
                    logError(text);
                });
                return;
            }

            // update Tags
            fetchTags();
            // Need to update files to remove deleted tag
            EventBus.$emit(Events.Search.Usual);
        })
        .catch(err => {
            logError(err);
        });
}

// Share

async function getShareTokens(): Promise<Map<string, Array<number>>> {
    return new Promise<Map<string, Array<number>>>((resolve, reject) => {
        fetch(Params.Host + "/api/share/tokens", {
            credentials: "same-origin"
        })
            .then(resp => {
                if (IsErrorStatusCode(resp.status)) {
                    resp.text().then(text => reject(text));
                    return;
                }

                return resp.json();
            })
            .then(json => {
                if (json === undefined) {
                    reject("invalid response");
                    return;
                }

                let res: Map<string, Array<number>> = new Map();

                for (let token in json) {
                    let arr = json[token] as Array<number>;
                    if (arr.length === undefined) {
                        continue;
                    }

                    res.set(token, arr);
                }

                resolve(res);
            })
            .catch(err => reject(err));
    });
}

function removeShareToken(token: string) {
    fetch(Params.Host + "/api/share/token/" + token, {
        method: "DELETE",
        credentials: "same-origin"
    })
        .then(resp => {
            if (IsErrorStatusCode(resp.status)) {
                resp.text().then(text => {
                    logError(text);
                });
                return;
            }

            logInfo(`Share token "${token}" was deleted`);
        })
        .catch(err => {
            logError(err);
        });
}

// Other

function logout() {
    if (!confirm("Are you sure you want log out?")) {
        return;
    }

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

            // clear settings
            SharedState.commit("resetSettings");
            window.location.reload();
        })
        .catch(err => logError(err));
}

const API = {
    isUserAuthorized: isUserAuthorized,
    files: {
        fetch: fetchFiles,
        downloadFile: downloadFile,
        downloadFiles: downloadFiles,
        //
        changeName: changeFileName,
        changeTags: changeFileTags,
        changeDescription: changeFileDescription,
        changeFilesTags: changeFilesTags,
        //
        recover: recoverFiles,
        delete: deleteFiles,
        //
        share: shareFiles
    },
    tags: {
        fetch: fetchTags,
        add: addTag,
        change: changeTag,
        delete: deleteTag
    },
    share: {
        getTokens: getShareTokens,
        removeToken: removeShareToken
    },
    management: {
        logout: logout
    }
};

export default API;
