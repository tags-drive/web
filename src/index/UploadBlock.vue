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
					v-for="(tag, index) in SharedStore.state.allTags"
					:key="index"
					style="display: flex; margin-bottom: 5px;"
				>
					<div style="width: 200px; display: flex; ">
						<tag :tag="tag"></tag>
					</div>
					<div style="font-size: 20px;">
						<input
							type="checkbox"
							style="transform: scale(1.4);"
							@click="updateTags(tag.id)">
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

<script>
import axios from "axios";
//
import TagComponent from "./components/Tag.vue";
//
import { Events, EventBus } from "./eventBus/eventBus";

export default {
    data: function() {
        return {
            counter: 0, // for definition did user drag file into div. If counter > 0, user dragged file.
            // states
            showChosenFiles: false,
            uploading: false,
            uploadPercentage: 0,
            //
            files: [],
            tags: {}
        };
    },
    components: {
        tag: TagComponent
    },
    created() {
        // Add listeners
        document.ondragenter = () => {
            if (this.SharedState.state.showDropLayer) {
                this.counter++;
            }
        };
        document.ondragleave = () => {
            if (this.SharedState.state.showDropLayer) {
                this.counter--;
            }
        };
        document.ondrop = () => {
            if (this.SharedState.state.showDropLayer) {
                this.counter = 0;
            }
        };
    },
    methods: {
        showFilesMenu: function(event) {
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

            let tags = Object.keys(this.tags).join(",");

            // Reset vars
            this.tags = {};
            this.files = [];
            this.showChosenFiles = false;

            var config = {
                onUploadProgress: ev => {
                    this.uploadPercentage = Math.round((ev.loaded / ev.total) * 100);
                }
            };

            // We use axios for upload bar
            axios
                .post(this.Params.Host + "/api/files?tags=" + tags, formData, config)
                .then(resp => {
                    this.uploading = false;

                    if (this.isErrorStatusCode(resp.status)) {
                        resp.text().then(text => {
                            this.logError(text);
                        });
                        return;
                    }

                    // Update list of files
                    EventBus.$emit(Events.UsualSearch);
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
                            this.logError(msg);
                        } else {
                            this.logInfo(msg);
                        }
                    }
                })
                .catch(err => {
                    this.uploading = false;
                    this.logError(err);
                });
        },
        addFileSource: function(file) {
            let id = "preview-for-file-" + file.name;

            if (file.type == "image/jpeg" || file.type == "image/png" || file.type == "image/gif") {
                // Load preview fron Disk
                let reader = new FileReader();
                reader.readAsDataURL(file);

                reader.onloadend = () => {
                    // An element already exists, when file is loaded
                    document.getElementById(id).src = reader.result;
                };
            } else {
                // Load extension
                let path = this.Params.Host + "/ext/" + file.name.split(".").pop();

                // Need to wait for element creation
                let f = () => {
                    let elem = document.getElementById(id);
                    if (elem === null) {
                        setTimeout(f, 20);
                        return;
                    }
                    elem.src = path;
                };

                f();
            }
        },
        updateTags: function(id) {
            if (this.tags[id] === undefined) {
                this.tags[id] = true;
            } else {
                delete this.tags[id];
            }
        },
        hideWindow: function() {
            // Shouldn't close window during file uploading
            if (!this.uploading) {
                this.showChosenFiles = false;
            }
        }
    }
};
</script>
