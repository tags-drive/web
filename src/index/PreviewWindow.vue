<template>
	<div
		id="preview-background"
		@click.self="window().hide()"
		v-if="show"
	>
		<div
			id="preview-window"
			:style="previewWindowStyle"
		>
			<!-- Preview -->
			<div
				id="preview"
				:style="previewStyle"
			>
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
					v-if="fileIndex < allFiles.length - 1"
					class="switch-button"
					style="right: 0;"
					@click="nextPreview"
				>
					<i class="material-icons noselect switch-button__arrow">keyboard_arrow_right</i>
				</div>

				<!-- Turn on fullscreen button -->
				<div
					v-show="!fullscreenMode"
					id="turn-on-fullscreen-button"
					title="Fullscreen mode"
					@click="fullscreenMode = true;"
				>
					<i style="font-size: 50px; opacity: inherit;" class="material-icons noselect">fullscreen</i>
				</div>
				<!-- Turn off fullscreen button -->
				<div
					v-show="fullscreenMode"
					id="turn-off-fullscreen-button"
					title="Close fullscreen window"
					@click="fullscreenMode = false;"
				>
					<i style="font-size: 50px; opacity: inherit;" class="material-icons noselect">close</i>
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
					<img :src="imageLink">
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
			<div
				v-show="!fullscreenMode"
				id="info"
			>
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
							:tag="Store.allTags.get(id)"
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
    height: 70%;
    opacity: 0.3;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 80px;
}

.switch-button__arrow {
    font-size: 50px;
    left: 50%;
    opacity: inherit;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
}

#turn-on-fullscreen-button {
    border-radius: 5px;
    bottom: 10px;
    cursor: pointer;
    opacity: 0.3;
    position: absolute;
    right: 0;
    text-align: center;
    width: 80px;
}

#turn-off-fullscreen-button {
    border-radius: 5px;
    cursor: pointer;
    opacity: 0.3;
    position: fixed;
    right: 10px;
    text-align: center;
    top: 10px;
    width: 50px;
}

.switch-button:hover,
#turn-on-fullscreen-button:hover,
#turn-off-fullscreen-button:hover {
    background-color: #00000020;
    opacity: 0.8;
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

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// Components
import TagComponent from "@components/Tag/Tag.vue";
// Classes and types
import { File } from "@app/index/global";
// Shared data
import SharedStore from "@app/index/store";
import { Store } from "@app/index/store/types";
import SharedState from "@app/index/state";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import { Params } from "@app/global";
import { logError } from "@app/index/tools";

@Component({
    components: {
        tag: TagComponent
    }
})
export default class extends Vue {
    show: boolean = false;
    fullscreenMode: boolean = false;
    // File
    fileIndex: number = 0;
    file: File = new File();
    // Data
    textFileContent: string = "";
    //
    Store: Store = SharedStore.state;

    get allFiles() {
        // For reactive updating (see @app/index/store/types.ts for more information)
        return SharedStore.state.allFilesChangesCounter && SharedStore.state.allFiles;
    }

    get imageLink(): string {
        return Params.Host + "/" + this.file.origin;
    }

    get previewWindowStyle() {
        if (!this.fullscreenMode) {
            return {};
        }

        return {
            "background-color": "gray",
            "border-radius": "0px",
            height: "100%",
            "max-width": "none",
            padding: "0px",
            top: "0",
            width: "100%"
        };
    }

    get previewStyle() {
        if (!this.fullscreenMode) {
            return {};
        }

        return {
            height: "90%",
            margin: "auto",
            width: "90%"
        };
    }

    created() {
        EventBus.$on(Events.ShowPreview, (payload: any) => {
            if (payload === undefined || !(payload.file instanceof File)) {
                /* eslint-disable no-console */
                console.error("Events.ShowPreview: payload isn't valid:", payload);
                /* eslint-enable no-console */
                return;
            }

            this.file = payload.file;

            // Define fileIndex
            for (let i = 0; i < SharedStore.state.allFiles.length; i++) {
                if (SharedStore.state.allFiles[i].filename === this.file.filename) {
                    this.fileIndex = i;
                    break;
                }
            }

            this.textFileContent = "";
            if (this.isTextFile()) {
                fetch(Params.Host + "/" + this.file.origin, {
                    method: "GET",
                    credentials: "same-origin"
                })
                    .then(resp => resp.text())
                    .then(text => (this.textFileContent = text))
                    .catch(err => logError(err));
            }

            this.window().show();
        });
    }

    window() {
        return {
            show: () => {
                SharedState.commit("hideDropLayer");
                document.addEventListener("keydown", this.onkeydownListener);
                this.show = true;
            },
            hide: () => {
                SharedState.commit("showDropLayer");
                document.removeEventListener("keydown", this.onkeydownListener);
                this.fullscreenMode = false;
                this.show = false;
            }
        };
    }

    isTextFile() {
        let ext = this.file.filename.split(".").pop();
        return ext === "txt";
    }

    isImage() {
        return this.file.type === "image";
        // return ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "gif";
    }

    nextPreview() {
        if (this.fileIndex < SharedStore.state.allFiles.length - 1) {
            this.file = SharedStore.state.allFiles[++this.fileIndex];

            if (this.isTextFile()) {
                fetch(Params.Host + "/" + this.file.origin, {
                    method: "GET",
                    credentials: "same-origin"
                })
                    .then(resp => resp.text())
                    .then(text => (this.textFileContent = text))
                    .catch(err => logError(err));
            }
        }
    }

    previousPreview() {
        if (this.fileIndex > 0) {
            this.file = SharedStore.state.allFiles[--this.fileIndex];

            if (this.isTextFile()) {
                fetch(Params.Host + "/" + this.file.origin, {
                    method: "GET",
                    credentials: "same-origin"
                })
                    .then(resp => resp.text())
                    .then(text => (this.textFileContent = text))
                    .catch(err => logError(err));
            }
        }
    }

    onkeydownListener(event: KeyboardEvent) {
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
</script>
