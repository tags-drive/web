import { Params } from "@app/global";
import { EventBus, Events } from "@app/index/eventBus";
import { isErrorStatusCode, logError, logInfo } from "@app/index/tools";

// Files
function fetchFiles() {}

function downloadFile(id: number) {}

function downloadFiles(ids: number[]) {}

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
            EventBus.$emit(Events.FilesBlock.UnselectAllFiles);
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
function fetchTags() {}

function addTag() {}

function changeTag() {}

function deleteTag() {}

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
