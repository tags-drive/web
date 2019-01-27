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
					id="turn-off-fullscreen-button__wrapper"
				>
					<div
						id="turn-off-fullscreen-button"
						title="Close fullscreen window"
						@click="fullscreenMode = false;"
					>
						<i style="font-size: 50px; opacity: inherit;" class="material-icons noselect">close</i>
					</div>
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

				<!-- Filename (only in fullscreen mode) -->
				<div
					id="fullscreen-filename"
					v-show="fullscreenMode"
				>
					<span>{{file.filename}}</span>
				</div>
			</div>

			<!-- Info -->
			<div
				v-show="!fullscreenMode"
				id="info"
			>
				<!-- Filename -->
				<div class="card">
					<div class="card__header noselect">File ID</div>
					<div class="card__data">
						{{file.id}}
					</div>
				</div>

				<!-- Filename -->
				<div class="card">
					<div class="card__header noselect">
						Filename
						<i
							class="material-icons noselect"
							title="Edit filename"
							@click="edit().filename()"
						>edit</i>
					</div>
					<div class="card__data">
						{{file.filename}} <span v-if="file.deleted" style="color: red">(in Trash)</span>
					</div>
				</div>

				<!-- Tags -->				
				<div class="card">
					<div class="card__header noselect">
						Tags
						<i
							class="material-icons noselect"
							title="Edit tags"
							@click="edit().tags()"
						>edit</i>
					</div>
					<div class="card__data" style="font-size: initial;">
						<div v-if="file.tags.length === 0">Empty</div>
						<div
							v-else
							id="tags"
							style="display: flex; flex-wrap: wrap;"
						>
							<tag
								v-for="(id, index) in file.tags"
								:key="index"
								:tag="Store.allTags.get(id)"
								style="margin-bottom: 3px;"
							></tag>
						</div>
					</div>
				</div>

				<!-- Description -->
				<div class="card">
					<div class="card__header noselect">
						Description
						<i
							class="material-icons noselect"
							title="Edit description"
							@click="edit().description()"
						>edit</i>
					</div>
					<div class="card__data">
						{{file.description === "" ? 'Empty' : file.description}}
					</div>
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

#turn-off-fullscreen-button__wrapper {
    position: absolute;
    right: 0;
    top: 0;
    /* Same as width of switch-button */
    width: 80px;
}

#turn-off-fullscreen-button {
    border-radius: 5px;
    cursor: pointer;
    margin: auto;
    opacity: 0.3;
    text-align: center;
    width: 50px;
}

.switch-button:hover,
#turn-on-fullscreen-button:hover,
#turn-off-fullscreen-button:hover {
    background-color: #00000020;
    opacity: 0.8;
}

#fullscreen-filename {
    background-color: #00000040;
    border-radius: 3px;
    color: #ffffffd0;
    height: auto;
    margin: auto;
    margin-top: 5px;
    padding: 3px;
    width: fit-content;
}

#text-preview,
#image-preview {
    height: 100%;
    margin: auto;
    width: 80%;
}

#text-preview,
#unsopported-format {
    background-color: white;
    border-radius: 5px;
    height: 100%;
    margin: auto;
    /* If width == 100%, buttons cover text */
    width: 70%;
}

#unsopported-format {
    font-size: 30px;
    text-align: center;
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

#info {
    background-color: #f7f7f7;
    border-radius: 5px;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    width: 24%;
}

/* Info blocks */
.card {
    background-color: white;
    border: 1px solid #00000012;
    border-bottom: 1px solid #00000060;
    border-radius: 3px;
    margin: 5px;
    margin-bottom: 7px;
    padding: 3px;
}

.card__header {
    border-bottom: 1px solid #00000060;
    border-radius: 3px;
    font-size: 18px;
    margin: auto;
    position: relative;
    text-align: center;
}

.card__header > i {
    cursor: pointer;
    font-size: 20px;
    position: absolute;
    right: 0;
    top: 0;
}

.card__data {
    font-size: 14px;
    padding: 5px;
    word-wrap: break-word;
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
import { logError, preloadImages } from "@app/index/tools";

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
    file: File | null = null;
    // Data
    textFileContent: string = "";
    //
    Store: Store = SharedStore.state;

    get allFiles() {
        // For reactive updating (see @app/index/store/types.ts for more information)
        return SharedStore.state.allFilesChangesCounter && SharedStore.state.allFiles;
    }

    get imageLink(): string {
        return Params.Host + "/" + this.file!.origin;
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
            "margin-top": "30px",
            width: "96%"
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
                if (SharedStore.state.allFiles[i].id === this.file!.id) {
                    this.fileIndex = i;
                    break;
                }
            }

            this.textFileContent = "";
            if (this.isTextFile()) {
                fetch(Params.Host + "/" + this.file!.origin, {
                    method: "GET",
                    credentials: "same-origin"
                })
                    .then(resp => resp.text())
                    .then(text => (this.textFileContent = text))
                    .catch(err => logError(err));
            }

            this.window().show();
        });

        // When ModalWindow is closed the file was already changed, but we have to
        // wait for loading of all files
        EventBus.$on(Events.ModalWindow.HideWindow, () => {
            if (this.file === null || !this.show) {
                return;
            }

            setTimeout(() => {
                this.updatePreview();
            }, 100); // 100ms is enough for 3G and faster
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

    edit() {
        return {
            filename: () => {
                EventBus.$emit(Events.ModalWindow.RegularMode.ShowFileRenamingWindow, { file: this.file });
            },
            tags: () => {
                EventBus.$emit(Events.ModalWindow.RegularMode.ShowTagsChangingWindow, { file: this.file });
            },
            description: () => {
                EventBus.$emit(Events.ModalWindow.RegularMode.ShowFileDescriptionChangingWindow, { file: this.file });
            }
        };
    }

    isTextFile(): boolean {
        if (this.file === null) {
            return false;
        }

        let ext = this.file.filename.split(".").pop();
        return this.file.type === "file" && ext === "txt";
    }

    isImage() {
        if (this.file === null) {
            return "";
        }

        return this.file.type === "image";
        // return ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "gif";
    }

    nextPreview() {
        if (this.fileIndex < SharedStore.state.allFiles.length - 1) {
            this.file = SharedStore.state.allFiles[++this.fileIndex];
            if (this.fileIndex < SharedStore.state.allFiles.length - 1) {
                preloadImages(SharedStore.state.allFiles[this.fileIndex + 1].origin);
            }

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
            if (this.fileIndex > 0) {
                preloadImages(SharedStore.state.allFiles[this.fileIndex - 1].origin);
            }

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

    updatePreview() {
        if (this.file === null) {
            return;
        }

        for (let i = 0; i < SharedStore.state.allFiles.length; i++) {
            if (SharedStore.state.allFiles[i].id === this.file.id) {
                // Updating fileIndex is confusing. So it's better not to change it
                // this.fileIndex = i;
                this.file = SharedStore.state.allFiles[i];
                break;
            }
        }
    }

    onkeydownListener(event: KeyboardEvent) {
        if (SharedState.state.showModalWindow) {
            return;
        }

        switch (event.key) {
            case "ArrowRight":
                this.nextPreview();
                break;
            case "ArrowLeft":
                this.previousPreview();
                break;
            case "Escape":
                if (this.fullscreenMode) {
                    this.fullscreenMode = false;
                    break;
                }
                this.window().hide();
                break;
        }
    }
}
</script>
