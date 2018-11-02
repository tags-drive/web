<template>
	<div
		style="text-align: center;"
		@drop.prevent="upload"
		@dragover.prevent
	>
		<div
			id="upload-text"
			v-if="counter != 0"
		>
			<div style="display: table; height: 100%; overflow: hidden; margin: auto;">
				<div style="display: table-cell; vertical-align: middle; text-align: center;">
					Upload new files
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
#upload-text {
    border: 2px #888888 dotted;
    border-radius: 15px;
    color: #888888;
    display: inline-block;
    font-size: 50px;
    height: 90vh;
    left: 5vw;
    margin: auto;
    position: fixed;
    top: 8vh;
    width: 90vw;
    z-index: 1;
}
</style>

<script>
export default {
    data: function() {
        return {
            counter: 0 // for definition did user drag file into div. If counter > 0, user dragged file.
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
                this.SharedState.commit("increaseMainBlockOpacity");
            } else {
                this.SharedState.commit("reduceMainBlockOpacity");
            }
        }, 10);
    },
    methods: {
        upload: function(event) {
            var formData = new FormData();

            for (let file of event.dataTransfer.files) {
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
        }
    }
};
</script>
