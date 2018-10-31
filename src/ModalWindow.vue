<template>
	<div
		id="background"
		v-if="show"
		@click.self="hideWindow"
	>
		<div id="modal-window">
			<!-- Global tags mode -->
			<div v-if="globalTagsMode" id="global-tags" class="modal-window__input">
				<!-- Existed tags -->
				<modifying-tags
					v-for="(tag, index) in SharedStore.state.allTags"
					:key="index"
					:tag="tag"
					></modifying-tags>
				<p></p>

				<input
					class="btn"
					style="width: 150px; height: 25px;"
					type="button"
					@click="newTag.name == undefined ? newTag = {'name': 'new tag', 'color': '#ffffff'} : {}"
					value="Create new tag">
				<p></p>

				<!-- New tag -->
				<modifying-tags
					v-if="newTag.name !== undefined"
					:tag="newTag"
					:is-new-tag="true"
				></modifying-tags>
			</div>
			<!-- Regular rename mode -->
			<div v-else-if="regularRenameMode" class="modal-window__input">
				<div style="margin-bottom: 5px;">Current filename: "{{file.filename}}"</div>
				<input type="text" style="margin-bottom: 5px; width: 400px;" v-model="fileNewData.newFilename" placeholder="New filename">
				<br>
				<input class="btn" type="button" value="Rename" @click="filesAPI().rename()">
			</div>
			<!-- Regular tags updating -->
			<div v-else-if="regularFileTagsMode" class="modal-window__input">
				<!-- Current tags -->
				<div class="modal-window__tags-field" title="Tags of a file" @drop.prevent="tagsDragAndDrop().add($event)"
				@dragover.prevent>
					<tags-input
						v-for="(tag, index) in fileNewData.newTags"
						:key="index"
						:tag="tag"
					></tags-input>
				</div>

				<div style="border-bottom: 1px solid black; width: 90%; margin: 20px auto 20px auto;"></div>

				<!-- All tags -->
				<div class="modal-window__tags-field" title="Unused tags" @drop.prevent="tagsDragAndDrop().del($event)"
				@dragover.prevent>
					<tags-input
						v-for="(tag, index) in fileNewData.unusedTags"
						:key="index"
						:tag="tag">
					</tags-input>
				</div>
				<br>
				<input class="btn" type="button" value="Change tags" @click="filesAPI().updateTags()">
			</div>
			<!-- Regular description changing -->
			<div v-else-if="regularDescriptionMode" class="modal-window__input">
				<textarea
					style="outline: none; margin-bottom: 5px;"
					placeholder="Current description: empty"
					readonly="readonly"
					v-model="file.description"
				></textarea>

				<textarea
					style="margin-bottom: 5px;"
					placeholder="New description"
					v-model="fileNewData.newDescription"
				></textarea>

				<input class="btn" type="button" value="Update" @click="filesAPI().updateDescription()">
			</div>
			<!-- Regular delete mode -->
			<div v-else-if="regularDeleteMode" class="modal-window__input">
				<input
					type="button"
					class="btn deleteBtn"
					style="height: 50px; width: 100px;"
					value="Delete"
					@click="filesAPI().deleteFile()">
				
				<input
					type="button"
					class="btn"
					style="height: 50px; width: 100px;"
					value="Cancel"
					@click="hideWindow">
			</div>
			<!-- Select tags adding -->
			<div v-else-if="selectFilesTagsAddMode" class="modal-window__input">
				<div style="font-size: 20px;">Add tags</div>
				<p></p>
				<div style="margin-right: auto; margin-left: auto; width: 40%;">
					<tags-manager
						mode="add"
						:tags="SharedStore.state.allTags"
					></tags-manager>
				</div>
			</div>
			<!-- Select tags deleting -->
			<div v-else-if="selectFilesTagsDeleteMode" class="modal-window__input">
				<div style="font-size: 20px;">Delete tags</div>
				<p></p>
				<div style="margin-right: auto; margin-left: auto; width: 40%;">
					<tags-manager
						mode="del"
						:tags="SharedStore.state.allTags"
					></tags-manager>
				</div>
			</div>
			<!-- Select delete mode -->
			<div v-else-if="selectDeleteMode" class="modal-window__input">
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
					style="height: 50px; width: 100px;"
					value="Delete"
					@click="filesAPI().deleteSelectedFiles()">

				<input
					type="button"
					class="btn"
					style="height: 50px; width: 100px;"
					value="Cancel"
					@click="hideWindow">
			</div>
		</div>
	</div>
</template>

<style>
#background {
    background-color: rgba(0, 0, 0, 0.3);
    height: 100vh;
    left: 0;
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 2;
}

#modal-window {
    background-color: var(--primary-color);
    border-radius: 5px;
    margin-left: auto;
    margin-right: auto;
    padding: 10px;
    position: relative;
    top: 10vh;
    width: 600px;
    z-index: 3;
}

.modal-window__input {
    padding: 5px;
    text-align: center;
}

.modal-window__input > textarea {
    display: block;
    height: 70px;
    margin: auto;
    resize: none;
    width: 400px;
}

.modal-window__tags-field {
    border: 1px dashed var(--primary-border-color);
    border-radius: 5px;
    display: flex;
    flex-wrap: wrap;
    margin: 0 auto;
    min-height: 40px;
    padding: 10px;
    width: 80%;
}

#modal-window__error {
    background-color: rgba(255, 161, 161, 0.883);
    border: 1.5px rgba(255, 0, 0, 0.65) solid;
    border-radius: 5px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 10px;
    padding: 5px;
    width: 80%;
}

.deleteBtn {
    background-color: rgba(255, 0, 0, 0.65);
}

.deleteBtn:hover {
    background-color: rgba(221, 3, 3, 0.8);
}
</style>

<script>
// Components
import TagsInput from "./components/TagsInput.vue";
import TagsManager from "./components/TagsManager.vue";
import ModifyingTags from "./components/ModifyingTags.vue";
//
import { Events, EventBus } from "./eventBus";

export default {
    data: function() {
        return {
            file: null,
            show: false,
            selectedFiles: [],
            // Modes
            globalTagsMode: false,
            //
            regularRenameMode: false,
            regularFileTagsMode: false,
            regularDescriptionMode: false,
            regularDeleteMode: false,
            //
            selectFilesTagsAddMode: false,
            selectFilesTagsDeleteMode: false,
            selectDeleteMode: false,
            // For files API
            fileNewData: {
                newFilename: "",
                unusedTags: [],
                newTags: [],
                newDescription: ""
            },
            // For tags API
            newTag: {}
        };
    },
    components: {
        "tags-input": TagsInput,
        "tags-manager": TagsManager,
        "modifying-tags": ModifyingTags
    },
    mounted: function() {
        EventBus.$on(Events.GlobalTagsChanging, () => {
            this.showWindow().globalTagsUpdating();
        });
        // Regular
        EventBus.$on(Events.RegularFileRenaming, payload => {
            this.showWindow().regularRenaming(payload.file);
        });
        EventBus.$on(Events.RegularTagsChanging, payload => {
            this.showWindow().regularFileTagsUpdating(payload.file);
        });
        EventBus.$on(Events.RegularDescriptionChanging, payload => {
            this.showWindow().regularDescriptionChanging(payload.file);
        });
        EventBus.$on(Events.RegularFileDeleting, payload => {
            this.showWindow().regularDeleting(payload.file);
        });
        // Selected
        EventBus.$on(Events.SelectTagsAdding, payload => {
            this.showWindow().selectFilesTagsAdding(payload.files);
        });
        EventBus.$on(Events.SelectTagsDeleting, payload => {
            this.showWindow().selectFilesTagsDeleting(payload.files);
        });
        EventBus.$on(Events.SelectFilesDeleting, payload => {
            this.showWindow().selectDeleting(payload.files);
        });
    },
    methods: {
        // UI
        showWindow: function() {
            return {
                globalTagsUpdating: () => {
                    this.SharedState.commit("hideDropLayer");

                    this.globalTagsMode = true;

                    this.show = true;
                },
                // Regular mode
                regularRenaming: file => {
                    this.SharedState.commit("hideDropLayer");

                    this.file = file;
                    this.regularRenameMode = true;
                    this.fileNewData.newFilename = file.filename;

                    this.show = true;
                },
                regularFileTagsUpdating: file => {
                    this.SharedState.commit("hideDropLayer");

                    this.fileNewData.newTags = [];
                    this.fileNewData.unusedTags = [];

                    for (let id in this.SharedStore.state.allTags) {
                        if (file.tags.includes(Number(id))) {
                            this.fileNewData.newTags.push(this.SharedStore.state.allTags[id]);
                        } else {
                            this.fileNewData.unusedTags.push(this.SharedStore.state.allTags[id]);
                        }
                    }

                    this.file = file;
                    this.regularFileTagsMode = true;

                    this.show = true;
                },
                regularDescriptionChanging: file => {
                    this.SharedState.commit("hideDropLayer");

                    this.file = file;
                    this.fileNewData.unusedTags;
                    this.regularDescriptionMode = true;

                    this.show = true;
                },
                regularDeleting: file => {
                    this.SharedState.commit("hideDropLayer");

                    this.file = file;
                    this.regularDeleteMode = true;

                    this.show = true;
                },
                // Select mode
                selectFilesTagsAdding: files => {
                    this.SharedState.commit("hideDropLayer");

                    this.selectedFiles = files;
                    this.selectFilesTagsAddMode = true;

                    this.show = true;
                },
                selectFilesTagsDeleting: files => {
                    this.SharedState.commit("hideDropLayer");

                    this.selectedFiles = files;
                    this.selectFilesTagsDeleteMode = true;

                    this.show = true;
                },
                selectDeleting: files => {
                    this.SharedState.commit("hideDropLayer");

                    this.selectedFiles = files;
                    this.selectDeleteMode = true;

                    this.show = true;
                }
            };
        },
        hideWindow: function() {
            this.globalTagsMode = false;
            this.regularRenameMode = false;
            this.regularFileTagsMode = false;
            this.regularDescriptionMode = false;
            this.regularDeleteMode = false;
            this.selectFilesTagsAddMode = false;
            this.selectFilesTagsDeleteMode = false;
            this.selectDeleteMode = false;
            this.show = false;

            this.SharedState.commit("showDropLayer");
        },
        // Drag and drop
        tagsDragAndDrop: function() {
            return {
                add: ev => {
                    let tagID = Number(ev.dataTransfer.getData("tagID"));
                    let index = -1;
                    for (let i in this.fileNewData.unusedTags) {
                        if (this.fileNewData.unusedTags[i].id == tagID) {
                            index = i;
                            break;
                        }
                    }
                    if (index == -1) {
                        return;
                    }
                    this.fileNewData.newTags.push(this.fileNewData.unusedTags[index]);
                    this.fileNewData.unusedTags.splice(index, 1);
                },
                del: ev => {
                    let tagID = ev.dataTransfer.getData("tagID");
                    let index = -1;
                    for (let i in this.fileNewData.newTags) {
                        if (this.fileNewData.newTags[i].id == tagID) {
                            index = i;
                            break;
                        }
                    }
                    if (index == -1) {
                        return;
                    }
                    this.fileNewData.unusedTags.push(this.fileNewData.newTags[index]);
                    this.fileNewData.newTags.splice(index, 1);
                }
            };
        },
        // Files API
        filesAPI: function() {
            return {
                // Regular mode
                rename: () => {
                    let params = new URLSearchParams();
                    params.append("file", this.file.filename);
                    params.append("new-name", this.fileNewData.newFilename);

                    fetch(this.Params.Host + "/api/files/name", {
                        method: "PUT",
                        body: params,
                        credentials: "same-origin"
                    })
                        .then(resp => {
                            if (this.isErrorStatusCode(resp.status)) {
                                resp.text().then(text => {
                                    this.logError(text);
                                });
                                return;
                            }
                            // Refresh list of files
                            EventBus.$emit(Events.UsualSearch);
                            this.hideWindow();
                        })
                        .catch(err => {
                            this.logError(err);
                        });
                },
                updateTags: () => {
                    let params = new URLSearchParams();
                    let tags = this.fileNewData.newTags.map(tag => tag.id);
                    params.append("file", this.file.filename);
                    params.append("tags", tags.join(","));

                    fetch(this.Params.Host + "/api/files/tags", {
                        method: "PUT",
                        body: params,
                        credentials: "same-origin"
                    })
                        .then(resp => {
                            if (this.isErrorStatusCode(resp.status)) {
                                resp.text().then(text => {
                                    this.logError(text);
                                });
                                return;
                            }
                            // Refresh list of files
                            EventBus.$emit(Events.UsualSearch);
                            this.hideWindow();
                        })
                        .catch(err => {
                            this.logError(err);
                        });
                },
                updateDescription: () => {
                    let params = new URLSearchParams();
                    params.append("file", this.file.filename);
                    params.append("description", this.fileNewData.newDescription);

                    fetch(this.Params.Host + "/api/files/description", {
                        method: "PUT",
                        body: params,
                        credentials: "same-origin"
                    })
                        .then(resp => {
                            if (this.isErrorStatusCode(resp.status)) {
                                resp.text().then(text => {
                                    this.logError(text);
                                });
                                return;
                            }
                            // Refresh list of files
                            EventBus.$emit(Events.UsualSearch);
                            this.hideWindow();
                        })
                        .catch(err => {
                            this.logError(err);
                        });
                },
                deleteFile: () => {
                    let params = new URLSearchParams();
                    params.append("file", this.file.filename);

                    fetch(this.Params.Host + "/api/files?" + params, {
                        method: "DELETE",
                        credentials: "same-origin"
                    })
                        .then(resp => {
                            if (this.isErrorStatusCode(resp.status)) {
                                resp.text().then(text => {
                                    this.logError(text);
                                });
                                return;
                            }

                            // Refresh list of files
                            this.SharedStore.commit("updateFiles");
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
                                    this.logError(msg);
                                } else {
                                    this.logInfo(msg);
                                }
                            }
                        })
                        .catch(err => this.logError(err));
                },
                // Select mode
                tagSelectedFiles: tagIDs => {
                    if (tagIDs.length == 0) {
                        return;
                    }

                    // Update tags and refresh list of files after all changes
                    (async () => {
                        for (let file of this.selectedFiles) {
                            let tags = new Set(file.tags);
                            for (let tag of tagIDs) {
                                tags.add(tag);
                            }

                            let params = new URLSearchParams();
                            params.append("file", file.filename);
                            params.append("tags", Array.from(tags).join(","));

                            await fetch(this.Params.Host + "/api/files/tags", {
                                method: "PUT",
                                body: params
                            })
                                .then(resp => {
                                    if (this.isErrorStatusCode(resp.status)) {
                                        resp.text().then(text => {
                                            this.logError(text);
                                        });
                                        return;
                                    }
                                })
                                .catch(err => this.logError(err));
                        }
                    })()
                        .then(() => {
                            // Refresh list of files
                            EventBus.$emit(Events.UnselectAllFiles);
                            EventBus.$emit(Events.UsualSearch);
                            this.hideWindow();
                        })
                        .catch(err => this.logError(err));
                },
                untagSelectedFiles: tagIDs => {
                    if (tagIDs.length == 0) {
                        return;
                    }

                    // Update tags and refresh list of files after all changes
                    (async () => {
                        for (let file of this.selectedFiles) {
                            let tags = new Set(file.tags);
                            for (let tag of tagIDs) {
                                tags.delete(tag);
                            }

                            let params = new URLSearchParams();
                            params.append("file", file.filename);
                            params.append("tags", Array.from(tags).join(","));

                            await fetch(this.Params.Host + "/api/files/tags", {
                                method: "PUT",
                                body: params
                            })
                                .then(resp => {
                                    if (this.isErrorStatusCode(resp.status)) {
                                        resp.text().then(text => {
                                            this.logError(text);
                                        });
                                    }
                                })
                                .catch(err => this.logError(err));
                        }
                    })()
                        .then(() => {
                            // Refresh list of files
                            EventBus.$emit(Events.UnselectAllFiles);
                            EventBus.$emit(Events.UsualSearch);
                            this.hideWindow();
                        })
                        .catch(err => this.logError(err));
                },
                deleteSelectedFiles: () => {
                    let params = new URLSearchParams();
                    for (let f of this.selectedFiles) {
                        params.append("file", f.filename);
                    }

                    fetch(this.Params.Host + "/api/files?" + params, {
                        method: "DELETE",
                        credentials: "same-origin"
                    })
                        .then(resp => {
                            if (this.isErrorStatusCode(resp.status)) {
                                resp.text().then(text => {
                                    this.logError(text);
                                });
                                return;
                            }

                            // Refresh list of files
                            this.SharedStore.commit("updateFiles");
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
                                    this.logError(msg);
                                } else {
                                    this.logInfo(msg);
                                }
                            }
                        })
                        .catch(err => this.logError(err));

                    // If we don't call this function, next files will become selected.
                    EventBus.$emit(Events.UnselectAllFiles);
                }
            };
        },
        // Tags API
        tagsAPI: function() {
            return {
                // Requests
                add: (name, color) => {
                    let params = new URLSearchParams();
                    params.append("name", name);
                    params.append("color", color);

                    fetch(this.Params.Host + "/api/tags", {
                        method: "POST",
                        body: params,
                        credentials: "same-origin"
                    })
                        .then(resp => {
                            if (this.isErrorStatusCode(resp.status)) {
                                resp.text().then(text => {
                                    this.logError(text);
                                });
                                return;
                            }

                            this.tagsAPI().delNewTag();
                            this.SharedStore.commit("updateTags");
                        })
                        .catch(err => {
                            this.logError(err);
                        });
                },
                change: (tagID, newName, newColor) => {
                    let params = new URLSearchParams();
                    params.append("id", tagID);
                    params.append("name", newName);
                    params.append("color", newColor);

                    fetch(this.Params.Host + "/api/tags", {
                        method: "PUT",
                        body: params,
                        credentials: "same-origin"
                    })
                        .then(resp => {
                            if (this.isErrorStatusCode(resp.status)) {
                                resp.text().then(text => {
                                    this.logError(text);
                                });
                                return;
                            }

                            this.SharedStore.commit("updateTags");
                        })
                        .catch(err => {
                            this.logError(err);
                        });
                },
                del: tagID => {
                    let params = new URLSearchParams();
                    params.append("id", tagID);

                    fetch(this.Params.Host + "/api/tags?" + params, {
                        method: "DELETE",
                        credentials: "same-origin"
                    })
                        .then(resp => {
                            if (this.isErrorStatusCode(resp.status)) {
                                resp.text().then(text => {
                                    this.logError(text);
                                });
                                return;
                            }

                            this.SharedStore.commit("updateTags");
                            // Need to update files to remove deleted tag
                            EventBus.$emit(Events.UsualSearch);
                            return resp.text();
                        })
                        .catch(err => {
                            this.logError(err);
                        });
                },
                // delNewTag deletes tag from tagsNewData.newTag
                delNewTag: () => {
                    this.newTag = {};
                }
            };
        }
    }
};
</script>
