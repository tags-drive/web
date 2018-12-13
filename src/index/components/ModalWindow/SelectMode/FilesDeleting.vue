<template>
	<div>
		<div style="font-size: 20px;">Selected files:</div>
		<br>
		<div style="text-align: left; max-height: 160px; overflow-y: auto;">
			<ul>
				<li	v-for="(file, index) in selectedFiles" :key="index">{{file.filename}}</li>
			</ul>
		</div>

		<div style="border-bottom: 1px solid black; width: 90%; margin: 20px auto 20px auto;"></div>

		<input
			type="button"
			class="btn deleteBtn"
			style="height: 50px; width: 120px;"
			value="Add into Trash"
			title="Files will be deleted in 7 days"
			@click="deleteSelectedFiles">

		<input
			type="button"
			class="btn recoverBtn"
			style="height: 50px; width: 120px; margin-left: 10px;"
			value="Recover"
			title="Files will be removed from Trash"
			@click="recoverSelectedFiles">

		<br>

		<!--  Force delete -->
		<input
			type="button"
			class="btn deleteForeverBtn"
			style="height: 30px; width: 130px; margin-top: 20px;"
			value="Delete files forever"
			title="This action can not be undone"
			@click="deleteSelectedFilesForever">
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
//
import { File } from "@/index/global";
//
import { Events, EventBus } from "@/index/eventBus";
// Utils
import { Params } from "@/global";
import { logError, logInfo, isErrorStatusCode } from "@/index/tools";

@Component({})
export default class extends Vue {
    @Prop() selectedFiles!: File[];

    deleteSelectedFiles(force: boolean) {
        let params = new URLSearchParams();
        for (let f of this.selectedFiles) {
            params.append("file", f.filename);
        }
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

        // If we don't call this function, next files will become selected.
        EventBus.$emit(Events.FilesBlock.UnselectAllFiles);
    }

    // deleteSelectedFilesForever is a wrapper over deleteFile
    deleteSelectedFilesForever() {
        this.deleteSelectedFiles(true);
    }

    recoverSelectedFiles() {
        let params = new URLSearchParams();
        for (let f of this.selectedFiles) {
            params.append("file", f.filename);
        }

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
            .then(() => logInfo("Files were recovered"))
            .catch(err => logError(err));
    }

    hideWindow() {
        alert("TODO");
    }
}
</script>
