<template>
	<div>
		<!-- Delete -->
		<input v-if="!file.deleted"
			type="button"
			class="btn deleteBtn"
			style="height: 50px; width: 120px;"
			value="Add into Trash"
			title="File will be deleted in 7 days"
			@click="deleteFile">

		<!-- Recover -->
		<input v-else
			type="button"
			class="btn recoverBtn"
			style="height: 50px; width: 120px;"
			value="Recover"
			title="File will be removed from Trash"
			@click="recoverFile">

		<br>

		<!--  Force delete -->
		<input
			type="button"
			class="btn deleteForeverBtn"
			style="height: 30px; width: 120px; margin-top: 20px; left: 5px;"
			value="Delete file forever"
			title="This action can not be undone"
			@click="deleteFileForever">
	</div>
</template>

<style scoped>
.deleteBtn {
    background-color: rgba(255, 0, 0, 0.6);
}

.deleteBtn:hover {
    background-color: rgba(255, 0, 0, 0.7);
}

.deleteForeverBtn {
    background-color: rgba(222, 0, 0, 0.2);
}

.deleteForeverBtn:hover {
    background-color: rgba(222, 0, 0, 0.7);
}

.recoverBtn {
    background-color: rgba(0, 200, 0, 0.6);
}

.recoverBtn:hover {
    background-color: rgba(0, 200, 0, 0.7);
}
</style>


<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
// Classes and types
import { File } from "@app/index/global";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import { Params } from "@app/global";
import { logError, logInfo, isErrorStatusCode } from "@app/index/tools";

@Component({})
export default class extends Vue {
    @Prop() file!: File;

    deleteFile(force: boolean) {
        let params = new URLSearchParams();
        params.append("file", this.file.filename);
        if (force === true) {
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

                // Refresh list of files
                EventBus.$emit(Events.Search.Usual);
                this.hideWindow();
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

    // deleteFileForever is a wrapper over deleteFile
    deleteFileForever() {
        this.deleteFile(true);
    }

    recoverFile() {
        let params = new URLSearchParams();
        params.append("file", this.file.filename);

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

                // Refresh list of files
                EventBus.$emit(Events.Search.Usual);
                EventBus.$emit(Events.FilesBlock.UnselectAllFiles);
                this.hideWindow();
            })
            .then(() => logInfo("File was recovered"))
            .catch(err => logError(err));
    }

    hideWindow() {
        EventBus.$emit(Events.ModalWindow.HideWindow);
    }
}
</script>
