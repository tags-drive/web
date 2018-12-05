<template>
	<!--
		counter != 0 - dragover
		showChosenFiles - show files previews and tags list
		uploading - show progress bar
	-->
	<div
		v-if="counter != 0 || showChosenFiles || uploading"
		id="background"
		@click.self="hideWindow"
	>
		<!-- Upload layer -->
		<div
			v-if="counter != 0"
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
				>
					<div class="file-preview">
						<img :id="'preview-for-file-' + file.name">
						<br>
						<!-- Just trigger preview loading -->
						{{ addFileSource(file) }}
						<span>{{ file.name }}</span>
					</div>
				</div>
			</div>

			<!-- Tags -->
			<div id="tags-list">
				<div
					v-for="(id, index) in Array.from(Store.allTags.keys())"
					:key="index"
					style="display: flex; margin-bottom: 5px;"
				>
					<div style="width: 200px; display: flex; ">
						<tag :tag="Store.allTags.get(id)"></tag>
					</div>
					<div style="font-size: 20px;">
						<input
							type="checkbox"
							style="transform: scale(1.4);"
							@click="updateTags(id)">
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
			id="upload-progress-bar"
		>
			<div id="bar">
				<div
					id="bar__inner"
					:style="{'width': uploadPercentage + '%'}">
				</div>
				<p></p>
				<span>{{uploadPercentage}}%</span>
			</div>
		</div>
	</div>
</template>

<style scoped>
input[type="checkbox"] {
    vertical-align: middle;
}

#background {
    background-color: rgba(0, 0, 0, 0.3);
    height: 100vh;
    left: 0;
    margin-bottom: 100px;
    overflow-y: auto;
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 2;
}

#upload-layer {
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
}

#upload-text {
    position: absolute;
    border: 2px black dotted;
    border-radius: 15px;
    font-size: 50px;

    /* Center */
    left: 50%;
    transform: translate(-50%, -100%);
    top: 50%;
}

#working-area {
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
}

#files-list {
    height: auto;
    overflow-x: auto;
    display: flex;
}

.file-preview {
    margin: 0 10px;
    overflow-wrap: break-word;
    text-align: center;
}

.file-preview > img {
    display: inline-block;
    height: auto;
    max-height: 100px;
    max-width: 100px;
    width: auto;
}

#tags-list {
    display: inline-block;
    margin-top: 10px;
}

#upload-progress-bar {
    background-color: white;
    border-radius: 5px;
    height: 150px;
    left: 50%;
    margin: auto;
    position: absolute;
    text-align: center;
    top: 10%;
    transform: translateX(-50%);
    width: 700px;
}

#bar {
    border: 1px solid black;
    box-sizing: border-box;
    height: 20px;
    left: 50%;
    position: absolute;
    top: 30%;
    transform: translateX(-50%);
    width: 400px;
}

#bar__inner {
    background-color: red;
    height: 100%;
}
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
//
import axios from "axios";
// Components
import TagComponent from "./components/Tag/Tag.vue";
// Shared data
import SharedStore from "./store";
import { Store } from "./store/types";
import SharedState from "./state";
//
import { Events, EventBus } from "./eventBus";
import { Tag } from "./global";
import { Params } from "../global";
import { isErrorStatusCode, logError, logInfo } from "./tools";

@Component({
    components: {
        tag: TagComponent
    }
})
export default class extends Vue {
    counter: number = 0; // for definition did user drag file into div. If counter > 0, user dragged file.
    // states
    showChosenFiles: boolean = false;
    uploading: boolean = false;
    uploadPercentage: number = 0;
    //
    files: File[] = [];
    tags: Map<number, Tag> = new Map();
    //
    Store: Store = SharedStore.state;

    created() {
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
    }

    showFilesMenu(event: DragEvent) {
        if (event.dataTransfer == null || event.dataTransfer.files == null) {
            return;
        }

        this.files = [];
        this.uploading = false;

        this.showChosenFiles = true;
        for (let i = 0; i < event.dataTransfer.files.length; i++) {
            this.files.push(event.dataTransfer.files[i]);
        }
    }

    upload() {
        this.uploading = true;
        this.uploadPercentage = 0;

        let formData = new FormData();
        for (let i = 0; i < this.files.length; i++) {
            formData.append("files", this.files[i], this.files[i].name);
        }

        let tags = Array.from(this.tags.keys()).join(",");

        // Reset vars
        this.tags.clear();
        this.files = [];
        this.showChosenFiles = false;

        var config = {
            onUploadProgress: (ev: ProgressEvent) => {
                this.uploadPercentage = Math.round((ev.loaded / ev.total) * 100);
            }
        };

        // We use axios for upload bar
        axios
            .post(Params.Host + "/api/files?tags=" + tags, formData, config)
            .then(resp => {
                this.uploading = false;

                if (isErrorStatusCode(resp.status)) {
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
    }

    addFileSource(file: File) {
        let id = "preview-for-file-" + file.name;

        if (file.type == "image/jpeg" || file.type == "image/png" || file.type == "image/gif") {
            // Load preview fron Disk
            let reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onloadend = () => {
                // An element already exists, when file is loaded
                let elem = <HTMLImageElement>document.getElementById(id);
                elem.src = <string>reader.result;
            };
        } else {
            // Load extension
            let path = Params.Host + "/ext/" + file.name.split(".").pop();

            // Need to wait for element creation
            let f = () => {
                let elem = <HTMLImageElement>document.getElementById(id)!;
                if (elem === null) {
                    setTimeout(f, 20);
                    return;
                }
                elem.src = path;
            };

            f();
        }
    }

    updateTags(id: number) {
        if (!this.tags.has(id)) {
            let t = SharedStore.state.allTags.get(id);
            if (t !== undefined) {
                this.tags.set(id, t);
            }
        } else {
            this.tags.delete(id);
        }
    }

    hideWindow() {
        // Shouldn't close window during file uploading
        if (!this.uploading) {
            this.showChosenFiles = false;
        }
    }
}
</script>
