<template>
	<div
		id="preview-background"
		@click.self="window().hide()"
		v-if="show"
	>
		<div id="preview-window">
			<!-- Preview -->
			<div id="preview">
				<!-- Previous button -->
				<div
					v-if="fileIndex > 0"
					class="switch-button"
					style="left: 0;"
					@click="previousPreview"
				>
					<i class="material-icons noselect switch-button__arrow">keyboard_arrow_left</i>
				</div>
				<!-- Next button -->
				<div
					v-if="fileIndex < SharedStore.state.allFiles.length - 1"
					class="switch-button"
					style="right: 0;"
					@click="nextPreview"
				>
					<i class="material-icons noselect switch-button__arrow">keyboard_arrow_right</i>
				</div>

				<!-- Text -->
				<div
					v-if="isTextFile()"
					id="text-preview"
				>
					<pre>{{textFileContent}}</pre>
				</div>
				<!-- Image -->
				<div
					v-else-if="isImage()"
					id="image-preview"
					class="noselect"
				>
					<span class="helper"></span>
					<img :src="Params.Host + '/' + file.origin">
				</div>
				<!-- Unsopported format -->
				<div
					v-else
					id="unsopported-format"
				>
					<br>
					<span>Preview for this file is unsupported</span>
				</div>
			</div>

			<!-- Info -->
			<div id="info">
				<!-- Filename -->
				<div class="header noselect" style="margin-top: 0; border-radius: inherit;">Filename</div>
				<div class="content">
					{{file.filename}} <span v-if="file.deleted" style="color: red">(in Trash)</span>
				</div>

				<!-- Tags -->
				<div class="header noselect">Tags</div>
				<div class="content" style="min-height: 30px;">
					<div v-if="file.tags.length === 0">Empty</div>
					<div v-else id="tags">
						<tag
							v-for="(id, index) in file.tags"
							:key="index"
							:tag="SharedStore.state.allTags[id]"
							style="margin-bottom: 3px;"
						></tag>
					</div>
				</div>

				<!-- Description -->
				<div class="header noselect">Description</div>
				<div class="content">
					{{file.description === "" ? 'Empty' : file.description}}
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
#preview-background {
    background-color: #00000070;
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 5;
}

#preview-window {
    background-color: #00000080;
    border-radius: 5px;
    display: flex;
    height: 80%;
    justify-content: space-between;
    margin: auto;
    max-width: 1100px;
    padding: 5px;
    position: relative;
    top: 70px;
    width: 90%;
}

#preview {
    height: 100%;
    position: relative;
    width: 75%;
}

/* Previews */
.switch-button {
    border-radius: 5px;
    cursor: pointer;
    height: 100%;
    opacity: 0.3;
    position: absolute;
    width: 15%;
}

.switch-button:hover {
    background-color: #00000020;
    opacity: 0.8;
}

.switch-button__arrow {
    font-size: 50px;
    left: calc(50% - 25px);
    opacity: inherit;
    position: absolute;
    top: calc(50% - 25px);
}

#text-preview,
#image-preview {
    height: 100%;
    width: 100%;
}

#text-preview {
    /* If width == 100%, buttons cover text */
    width: 70%;
    margin: auto;
    background-color: white;
    border-radius: 5px;
}

#text-preview > pre {
    margin: 0;
    padding: 10px;
}

#image-preview {
    text-align: center;
}

#image-preview > img {
    display: inline-block;
    height: auto;
    max-height: 100%;
    max-width: 100%;
    vertical-align: middle;
    width: auto;
}

/* Help to center an image vertically */
.helper {
    display: inline-block;
    height: 100%;
    vertical-align: middle;
}

#unsopported-format {
    background-color: white;
    font-size: 30px;
    height: 100%;
    text-align: center;
}

/* Info block */
#info {
    background-color: white;
    border-radius: 5px;
    width: 24%;
}

#tags {
    display: flex;
    flex-wrap: wrap;
}

.header {
    background-image: linear-gradient(white, #00000015, white);
    font-size: 20px;
    margin-top: 10px;
    text-align: center;
}

.content {
    font-size: 18px;
    padding: 5px;
    word-break: break-all;
}
</style>

<script>
import TagComponent from "./components/Tag.vue";
//
import { Events, EventBus } from "./eventBus/eventBus";

export default {
    data: function() {
        return {
            show: false,
            // File
            fileIndex: 0,
            file: Object,
            // Data
            textFileContent: ""
        };
    },
    components: {
        tag: TagComponent
    },
    mounted: function() {
        EventBus.$on(Events.ShowPreview, payload => {
            this.file = payload.file;
            // Define fileIndex
            for (let i in this.SharedStore.state.allFiles) {
                if (this.SharedStore.state.allFiles[i].filename == this.file.filename) {
                    this.fileIndex = i;
                    break;
                }
            }

            this.textFileContent = "";
            if (this.isTextFile()) {
                fetch(this.Params.Host + "/" + this.file.origin, {
                    method: "GET",
                    credentials: "same-origin"
                })
                    .then(resp => resp.text())
                    .then(text => (this.textFileContent = text))
                    .catch(err => this.logError(err));
            }

            this.window().show();
        });
    },
    methods: {
        window: function() {
            return {
                show: () => {
                    this.SharedState.commit("hideDropLayer");
                    document.addEventListener("keydown", this.onkeydownListener);
                    this.show = true;
                },
                hide: () => {
                    this.SharedState.commit("showDropLayer");
                    document.removeEventListener("keydown", this.onkeydownListener);
                    this.show = false;
                }
            };
        },
        isTextFile: function() {
            let ext = this.file.filename.split(".").pop();
            return ext == "txt";
        },
        isImage: function() {
            return this.file.type == "image";
            // return ext == "jpg" || ext == "jpeg" || ext == "png" || ext == "gif";
        },
        nextPreview: function() {
            if (this.fileIndex < this.SharedStore.state.allFiles.length - 1) {
                this.file = this.SharedStore.state.allFiles[++this.fileIndex];

                if (this.isTextFile()) {
                    fetch(this.Params.Host + "/" + this.file.origin, {
                        method: "GET",
                        credentials: "same-origin"
                    })
                        .then(resp => resp.text())
                        .then(text => (this.textFileContent = text))
                        .catch(err => this.logError(err));
                }
            }
        },
        previousPreview: function() {
            if (this.fileIndex > 0) {
                this.file = this.SharedStore.state.allFiles[--this.fileIndex];

                if (this.isTextFile()) {
                    fetch(this.Params.Host + "/" + this.file.origin, {
                        method: "GET",
                        credentials: "same-origin"
                    })
                        .then(resp => resp.text())
                        .then(text => (this.textFileContent = text))
                        .catch(err => this.logError(err));
                }
            }
        },
        onkeydownListener: function(event) {
            switch (event.key) {
                case "ArrowRight":
                    this.nextPreview();
                    break;
                case "ArrowLeft":
                    this.previousPreview();
                    break;
                case "Escape":
                    this.window().hide();
                    break;
            }
        }
    }
};
</script>
