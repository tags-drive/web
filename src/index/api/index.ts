import { Params } from "@app/global";
import { Const } from "@app/index/const.ts";
import { EventBus, Events } from "@app/index/eventBus";
import { isErrorStatusCode, logError, logInfo } from "@app/index/tools";
import SharedStore from "@app/index/store";

// Files

/**
 *
 * @param expression - logical expression
 * @param text – test to search
 * @param sType – sort type (use "" to search with default value)
 * @param sOrder – sort order (use "" to search with default value)
 */
function fetchFiles(expression: string, text: string, sType: string, sOrder: string) {
    let params = new URLSearchParams();
    // Expression
    params.append("expr", expression);
    params.append("search", text);
    if (sType !== "") {
        params.append("sort", sType);
    }
    if (sOrder !== "") {
        params.append("order", sOrder);
    }

    // Can skip sort and order, because server will use default values
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

function downloadFiles(ids: number[]) {
    let params = new URLSearchParams();
    params.append("ids", ids.join(","));

    fetch(Params.Host + "/api/files/download?" + params, {
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

function uploadFiles() {}

function changeFileName(id: number, newName: string) {
    let params = new URLSearchParams();
    params.append("new-name", newName);

    fetch(Params.Host + `/api/file/${id}/name?` + params, {
        method: "PUT",
        credentials: "same-origin"
    })
        .then(resp => {
            if (isErrorStatusCode(resp.status)) {
                resp.text().then(text => {
                    logError(text);
                });
                return;
            }

            // TODO
            // Refresh list of files
            EventBus.$emit(Events.Search.Usual);
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
            if (isErrorStatusCode(resp.status)) {
                resp.text().then(text => {
                    logError(text);
                });
                return;
            }

            // TODO
            // Refresh list of files
            EventBus.$emit(Events.Search.Usual);
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
            if (isErrorStatusCode(resp.status)) {
                resp.text().then(text => {
                    logError(text);
                });
                return;
            }

            // TODO
            // Refresh list of files
            EventBus.$emit(Events.Search.Usual);
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
            if (isErrorStatusCode(resp.status)) {
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
            if (isErrorStatusCode(resp.status)) {
                resp.text().then(text => {
                    logError(text);
                });
                return;
            }

            // TODO
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
            if (isErrorStatusCode(resp.status)) {
                resp.text().then(text => {
                    logError(text);
                });
                return;
            }

            // TODO
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

// Tags
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

function addTag(name: string, color: string) {
    let params = new URLSearchParams();
    params.append("name", name);
    params.append("color", color);

    fetch(Params.Host + "/api/tags?" + params, {
        method: "POST",
        credentials: "same-origin"
    })
        .then(resp => {
            if (isErrorStatusCode(resp.status)) {
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

function changeTag(tagID: number, newName: string, newColor: string) {
    let params = new URLSearchParams();
    params.append("id", String(tagID));
    params.append("name", newName);
    params.append("color", newColor);

    fetch(Params.Host + "/api/tags?" + params, {
        method: "PUT",
        credentials: "same-origin"
    })
        .then(resp => {
            if (isErrorStatusCode(resp.status)) {
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
            if (isErrorStatusCode(resp.status)) {
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

const API = {
    files: {
        fetch: fetchFiles,
        downloadFile: downloadFile,
        downloadFiles: downloadFiles,
        //
        uploadFiles: uploadFiles,
        //
        changeName: changeFileName,
        changeTags: changeFileTags,
        changeDescription: changeFileDescription,
        changeFilesTags: changeFilesTags,
        //
        recover: recoverFiles,
        delete: deleteFiles
    },
    tags: {
        fetch: fetchTags,
        add: addTag,
        change: changeTag,
        delete: deleteTag
    }
};

export default API;
