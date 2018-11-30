<template>
	<div
		v-if="counter != 0 || showChosenFiles"
		id="background"
		@click.self="showChosenFiles = false"
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
						<img
							:id="'preview-for-file-' + file.name"
							style="display: inline-block; height: auto; max-height: 100%; max-width: 100%; width: auto;">
						<br>
						<!-- Just trigger preview loading -->
						{{ addFileSource(file) }}
						<span>{{ file.name }}</span>
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
	</div>
</template>

<style scoped>
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
	height: 200px;
	overflow-x: auto;
	display: flex;
}

.file-preview {
	height: 100px;
	margin: 0 10px;
	overflow-wrap: break-word;
	text-align: center;
	width: 100px;
}
</style>

<script>
export default {
    data: function() {
        return {
            counter: 0, // for definition did user drag file into div. If counter > 0, user dragged file.
            showChosenFiles: false,
            files: []
        };
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

        setInterval(() => {
            if (this.counter == 0) {
                // this.SharedState.commit("increaseFilesBlockOpacity");
            } else {
                // this.SharedState.commit("reduceFilesBlockOpacity");
            }
        }, 10);
    },
    methods: {
        showFilesMenu: function(event) {
            this.files = [];

            this.showChosenFiles = true;
            for (let i = 0; i < event.dataTransfer.files.length; i++) {
                this.files.push(event.dataTransfer.files[i]);
            }
        },
        upload: function() {
            let formData = new FormData();

            for (let file of this.files) {
                formData.append("files", file, file.name);
            }

            fetch(this.Params.Host + "/api/files", {
                body: formData,
                method: "POST",
                credentials: "same-origin"
            })
                .then(resp => {
                    if (this.isErrorStatusCode(resp.status)) {
                        resp.text().then(text => {
                            this.logError(text);
                        });
                        return;
                    }
                    // Update list of files
                    this.SharedStore.commit("updateFiles");
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

            // Hide window
            this.showChosenFiles = false;
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
        }
    }
};
</script>
