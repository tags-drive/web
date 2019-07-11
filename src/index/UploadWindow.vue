<template>
	<div
		v-if="shouldShow"
		id="background"
		@click.self="hideWindow"
	>
		<!-- Upload layer -->
		<div
			v-if="counter !== 0"
			id="upload-layer"
			@drop.prevent="showFilesMenu"
			@dragover.prevent
		>
			<div
				id="upload-text"
				class="noselect"
			>
				<span>Upload new files</span>
			</div>
		</div>

		<!-- Working area -->
		<div
			v-show="showChosenFiles"
			id="working-area"
		>
			<!-- Previews -->
			<h2 class="noselect" style="margin-bottom: 10px;">Files</h2>
			<div id="files-list">
				<div
					v-for="(file, index) in files"
					:key="index"
					class="file-preview"
				>
					<img :id="'preview-for-file-' + file.name">
					<br>
					<!-- Just trigger preview loading -->
					{{ addFileSource(file) }}
					<span>{{ file.name }}</span>
				</div>
			</div>

			<!-- Tag groups -->
			<div id="groups-list">
				<div
					v-for="(group, i) in groups"
					:key="i"
					class="group"
				>
					<!-- Group name -->
					<div
						class="group-name noselect"
					>
						<i class="material-icons">navigate_next</i>
						<div><span>{{ group.name }}</span></div>
					</div>

					<!-- Tags -->
					<div
						v-for="(tag, j) in group.tags"
						:key="j"
						class="tag-wrapper"
					>
						<div class="tag">
							<tag :tag="tag"></tag>
						</div>
						<div class="checkbox">
							<input
								type="checkbox"
								@click="updateTags(tag.id)">
						</div>
					</div>
				</div>
			</div>

			<!-- Upload button -->
			<div style="margin: 10px 0;">
				<input
					type="button"
					class="btn"
					style="width: 150px; height: 50px;"
					value="Upload"
					@click="upload">
			</div>
		</div>

		<!-- Upload progress bar -->
		<div
			v-if="uploading"
			id="progress-bar"
		>
			<div id="bar">
				<div
					id="progress"
					:style="{'width': uploadPercentage + '%'}">
				</div>
			</div>

			<div id="info">
				<div id="percentages">{{uploadPercentage}}%</div>
				<div id="delimiter"></div>
				<div id="speed">{{
					// uploadSpeed is in KB/s by default
					(uploadSpeed >= 512) ?
					(uploadSpeed / 1024).toFixed(1) + " MB/s" :
					uploadSpeed.toFixed(1) + " KB/s"
				}}</div>
			</div>
		</div>
	</div>
</template>


<style lang="scss" scoped>
#background {
    background-color: rgba(0, 0, 0, 0.3);
    height: 100vh;
    left: 0;
    margin-bottom: 100px;
    overflow-y: auto;
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 3;

    > #upload-layer {
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;

        #upload-text {
            background-color: rgba(0, 0, 0, 0.15);
            border: 1px black solid;
            border-radius: 15px;
            font-size: 50px;
            left: 50%;
            padding: 15px;
            position: absolute;
            top: 50%;
            transform: translate(-50%, -100%);
        }
    }

    > #working-area {
        background-color: white;
        border-radius: 5px;
        height: auto;
        left: 50%;
        margin: auto;
        position: absolute;
        text-align: center;
        top: 10%;
        transform: translateX(-50%);
        width: 700px;

        > #files-list {
            height: auto;
            overflow-x: auto;
            display: flex;

            > .file-preview {
                margin: 0 10px;
                overflow-wrap: break-word;
                text-align: center;

                > img {
                    display: inline-block;
                    height: auto;
                    max-height: 100px;
                    max-width: 100px;
                    width: auto;
                }
            }
        }

        > #groups-list {
            display: inline-block;
            margin: 10px auto 0;
            width: 280px;

            > .group {
                > .group-name {
                    display: flex;
                    height: 24px;
                    line-height: 24px;
                    margin-bottom: 5px;
                    text-align: left;
                }

                > .tag-wrapper {
                    display: flex;
                    margin: 0 auto 5px;
                    width: fit-content;

                    > .tag {
                        display: flex;
                        width: 200px;
                    }

                    > .checkbox {
                        font-size: 20px;

                        > input[type="checkbox"] {
                            transform: scale(1.2);
                            vertical-align: middle;
                        }
                    }
                }
            }
        }
    }

    > #progress-bar {
        background-color: white;
        border-radius: 5px;
        margin: 10% auto;
        max-width: 600px;
        padding: 40px 0;
        position: relative;
        text-align: center;
        width: 80%;

        > #bar {
            border: 1px solid #888888;
            border-radius: 5px;
            box-sizing: border-box;
            height: 20px;
            margin: 0 auto;
            max-width: 400px;
            width: 80%;

            > #progress {
                background-color: red;
                border-radius: 4px;
                height: 100%;
            }
        }

        > #info {
            display: grid;
            grid-template-columns: 150px 2px 150px;
            grid-gap: 20px;
            margin-top: 15px;
            justify-content: center;

            > #percentages {
                text-align: right;
            }

            > #delimiter {
                border-right: 1px solid black;
                height: 100%;
            }

            > #speed {
                text-align: left;
            }
        }
    }
}
</style>


<script lang="ts">
import Vue from "vue";
// Components
import TagComponent from "@components/Tag/Tag.vue";
// Classes and types
import { Tag, Group, TagsToGroups } from "@app/global/classes";
// Shared data
import SharedStore from "@app/index/store";
import { Store } from "@app/index/store/types";
import SharedState from "@app/index/state";
// Other
import axios, { AxiosRequestConfig } from "axios";
import { Events, EventBus } from "@app/index/eventBus";
import { Params } from "@app/global";
import { logError, logInfo } from "@app/index/utils";
import { IsErrorStatusCode } from "@app/global/utils";

export default Vue.extend({
    components: {
        tag: TagComponent
    },
    //
    data: function() {
        return {
            counter: 0, // for definition did user drag file into div. If counter > 0, user dragged file.
            // states
            showChosenFiles: false,
            uploading: false,
            uploadPercentage: 0,
            uploadSpeed: 0, /// in KB/s
            //
            files: [] as Array<File>,
            selectedTags: new Set() as Set<Number>,
            //
            Store: SharedStore.state,
            State: SharedState.state
        };
    },
    computed: {
        shouldShow: function(): boolean {
            if (!this.State.user.authorized) {
                return false;
            }

            // counter != 0 - dragover
            // showChosenFiles - show files previews and tags list
            // uploading - show progress bar
            return this.counter !== 0 || this.showChosenFiles || this.uploading;
        },
        groups: function(): Array<Group> {
            let reactive = this.Store.allTagsChangesCounter;
            const allTags = this.Store.allTags;

            return TagsToGroups(allTags);
        }
    },
    //
    created: function() {
        // Add listeners
        document.ondragenter = () => {
            if (SharedState.state.showDropLayer) {
                this.counter++;
            }
        };
        document.ondragleave = () => {
            if (SharedState.state.showDropLayer) {
                this.counter--;
            }
        };
        document.ondrop = () => {
            if (SharedState.state.showDropLayer) {
                this.counter = 0;
            }
        };
    },
    //
    methods: {
        showFilesMenu: function(event: DragEvent) {
            if (event.dataTransfer === null || event.dataTransfer.files === null) {
                return;
            }

            this.files = [];
            this.uploading = false;

            this.showChosenFiles = true;
            for (let i = 0; i < event.dataTransfer.files.length; i++) {
                this.files.push(event.dataTransfer.files[i]);
            }
        },
        upload: function() {
            this.uploading = true;
            this.uploadPercentage = 0;

            let formData = new FormData();
            for (let i = 0; i < this.files.length; i++) {
                formData.append("files", this.files[i], this.files[i].name);
            }

            let tags = Array.from(this.selectedTags.values()).join(",");
            // Reset vars
            this.selectedTags.clear();
            this.files = [];
            this.showChosenFiles = false;

            let config: AxiosRequestConfig = {
                onUploadProgress: (() => {
                    let lastNow = new Date().getTime(),
                        uploaded = 0;

                    return (ev: ProgressEvent) => {
                        let now = new Date().getTime();

                        // Percentages
                        this.uploadPercentage = Math.round((ev.loaded / ev.total) * 100);

                        // Speed
                        let loaded = (ev.loaded - uploaded) / 1024; // KB
                        let delta = now - lastNow; // ms
                        this.uploadSpeed = (loaded * 1000) / delta; // KB/s

                        // Update
                        lastNow = now;
                        uploaded = ev.loaded;
                    };
                })()
            };

            // We use axios for upload bar
            axios
                .post(Params.Host + "/api/files?tags=" + tags, formData, config)
                .then(resp => {
                    this.uploading = false;

                    if (IsErrorStatusCode(resp.status)) {
                        logError(resp.data);
                        return;
                    }

                    // Update list of files
                    EventBus.$emit(Events.Search.Usual);
                    return resp.data;
                })
                .then(log => {
                    if (log === undefined) {
                        return;
                    }
                    // Schema:
                    // [
                    //     {
                    //         filename: string,
                    //         isError: boolean,
                    //         error: string (when isError == true),
                    //         status: string (when isError == false)
                    //     }
                    // ]
                    //
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
                .catch(err => {
                    this.uploading = false;
                    logError(err);
                });
        },
        addFileSource: function(file: File) {
            let id = "preview-for-file-" + file.name;

            if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/gif") {
                // Load preview fron Disk
                let reader = new FileReader();
                reader.readAsDataURL(file);

                reader.onloadend = () => {
                    // An element already exists, when file is loaded
                    let elem = document.getElementById(id) as HTMLImageElement;
                    elem.src = reader.result as string;
                };
            } else {
                // Load extension
                let path = Params.Host + "/ext/" + file.name.split(".").pop();

                // Need to wait for element creation
                let f = () => {
                    let elem = document.getElementById(id)! as HTMLImageElement;
                    if (elem === null || elem === undefined) {
                        setTimeout(f, 20);
                        return;
                    }
                    elem.src = path;
                };

                f();
            }
        },
        updateTags: function(id: number) {
            if (!this.selectedTags.has(id)) {
                this.selectedTags.add(id);
            } else {
                this.selectedTags.delete(id);
            }
        },
        hideWindow: function() {
            // Shouldn't close window during file uploading
            if (!this.uploading) {
                this.showChosenFiles = false;
            }
        }
    }
});
</script>
