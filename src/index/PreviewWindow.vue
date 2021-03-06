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
					class="switch-button preview-control"
					style="left: 0;"
					:style="switchButtonStyle"
					@click="previousPreview"
				>
					<i class="material-icons noselect arrow" style="left: 0;">keyboard_arrow_left</i>
				</div>
				<!-- Next button -->
				<div
					v-if="fileIndex < allFiles.length - 1"
					class="switch-button preview-control"
					style="right: 0;"
					:style="switchButtonStyle"
					@click="nextPreview"
				>
					<i class="material-icons noselect arrow" style="right: 0;">keyboard_arrow_right</i>
				</div>

				<!-- Turn on fullscreen button -->
				<div
					v-show="!fullscreenMode"
					class="fullscreen-button-wrapper"
					style="bottom: 10px;"
				>
					<div
						class="fullscreen-button preview-control"
						title="Fullscreen mode"
						@click="fullscreenMode = true;"
					>
						<i class="material-icons noselect">fullscreen</i>
					</div>
				</div>
				<!-- Turn off fullscreen button -->
				<div
					v-show="fullscreenMode"
					class="fullscreen-button-wrapper"
					style="top: 0;"
				>
					<div
						class="fullscreen-button preview-control"
						title="Close fullscreen window"
						@click="fullscreenMode = false;"
					>
						<i class="material-icons noselect">close</i>
					</div>
				</div>

				<!-- Text -->
				<div
					v-if="isTextFile"
					id="text-preview"
				>
					<pre>{{textFileContent}}</pre>
				</div>
				<!-- Image -->
				<div
					v-else-if="isImage"
					id="image-preview"
					class="noselect"
				>
					<span class="helper"></span>
					<loader :src="originLink"></loader>
				</div>
				<!-- Audio -->
				<div
					v-else-if="isAudio"
					id="audio-preview"
				>
					<audio controls style="width: 80%;" ref="audio-block">
						<source
							:src="originLink"
							:type="file.type.previewType">
						Your browser does not support the audio tag.
					</audio>
				</div>
				<!-- Video -->
				<div
					v-else-if="isVideo"
					id="video-preview"
				>
					<video
						width="100%" height="auto" controls
						ref="video-block"
					>
						<source
							:src="originLink"
							:type="file.type.previewType">
						Your browser does not support the video tag.
					</video> 
				</div>
				<!-- Unsupported format -->
				<div
					v-else
					id="unsupported-format"
				>
					<div style="padding: 15px 15px 0; word-wrap: break-word;">
						<span>
							File '{{ file.filename }}' can't be displayed
						</span>
						<br>
						<span style="font-size: 15px;">(Preview for this file is unsupported)</span>
					</div>

					<div style="margin-top: 10px;">
						<input
							type="button"
							class="btn"
							style="padding: 3px;"
							value="Try to open as a text file"
							@click="openAsTextFile">
					</div>
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
				<!-- ID -->
				<div class="card">
					<div class="header noselect">File ID</div>
					<div class="data">
						<span>{{file.id}}</span>
					</div>
				</div>

				<!-- Filename -->
				<div class="card">
					<div class="header noselect">
						<span>Filename</span>
						<i
							class="material-icons noselect"
							title="Edit filename"
							:class="{ 'auth-only-element': !showAuthOnlyElement }"
							@click="edit().filename()"
						>edit</i>
					</div>
					<div class="data">
						<span>{{file.filename}}</span>
						<span v-if="file.deleted"> (<i
							class="material-icons noselect in-trash-mark"
							title="In Trash"
						>delete</i>)</span>
					</div>
				</div>

				<!-- Tags -->
				<div class="card">
					<div class="header noselect">
						<span>Tags</span>
						<i
							class="material-icons noselect"
							title="Edit tags"
							:class="{ 'auth-only-element': !showAuthOnlyElement }"
							@click="edit().tags()"
						>edit</i>
					</div>
					<div class="data" style="font-size: initial;">
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
					<div class="header noselect">
						<span>Description</span>
						<i
							class="material-icons noselect"
							title="Edit description"
							:class="{ 'auth-only-element': !showAuthOnlyElement }"
							@click="edit().description()"
						>edit</i>
					</div>
					<div class="data">
						<span>{{file.description === "" ? 'Empty' : file.description}}</span>
					</div>
				</div>

				<!-- Size -->
				<div class="card">
					<div class="header noselect">
						<span>File size</span>
					</div>
					<div class="data">
						<span>{{ fileSize }}</span>
					</div>
				</div>

				<!-- Time of adding -->
				<div class="card">
					<div class="header noselect">
						<span>Time of adding</span>
					</div>
					<div class="data">
						<span>{{ fileAddTime }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>


<style lang="scss" scoped>
#preview-background {
    background-color: #00000090;
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 4;

    > #preview-window {
        background-color: #00000080;
        border-radius: 5px;
        display: grid;
        grid-column-gap: 1%;
        grid-template-columns: 75% 24%;
        grid-template-rows: 100%;
        height: 80%;
        margin: auto;
        max-width: 1100px;
        padding: 5px;
        position: relative;
        top: 50%;
        transform: translateY(-50%);
        width: 90%;

        > #preview {
            height: 100%;
            position: relative;

            // Preview controls

            .preview-control {
                color: #ffffff;
                opacity: 0.1;
                text-shadow: 0 0 2px #000000;

                &:hover {
                    opacity: 0.5;
                }
            }

            > .switch-button {
                border-radius: 5px;
                cursor: pointer;
                height: 80%;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 45%;

                > i.arrow {
                    font-size: 50px;
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                }
            }

            > .fullscreen-button-wrapper {
                position: absolute;
                right: 0;
                width: 50px;

                > .fullscreen-button {
                    border-radius: 5px;
                    cursor: pointer;
                    margin: auto;
                    text-align: center;
                    width: fit-content;

                    > i {
                        font-size: 50px;
                    }
                }
            }

            // Previews

            @mixin preview-block-common-styles {
                box-sizing: border-box;
                height: 100%;
                margin: auto;
                padding: 5px 0;
                width: 100%;
            }

            > #text-preview {
                @include preview-block-common-styles();

                background-color: white;
                border-radius: 5px;
                height: 100%;
                margin: auto;
                overflow: auto;
                width: 70%;

                > pre {
                    margin: 0;
                    padding: 10px;
                }
            }

            > #image-preview {
                @include preview-block-common-styles();

                text-align: center;

                /* Help to center an image vertically */
                > span.helper {
                    display: inline-block;
                    height: 100%;
                    vertical-align: middle;
                }

                > img {
                    background-color: rgb(255, 255, 255);
                    display: inline-block;
                    height: auto;
                    max-height: 100%;
                    max-width: 100%;
                    vertical-align: middle;
                    width: auto;
                }
            }

            > #audio-preview {
                @include preview-block-common-styles();

                position: relative;

                > audio {
                    left: 50%;
                    position: absolute;
                    top: 50%;
                    transform: translate(-50%, -50%);
                }
            }

            > #video-preview {
                @include preview-block-common-styles();

                > video {
                    max-height: 100%;
                    position: relative;
                    top: 50%;
                    transform: translateY(-50%);
                }
            }

            > #unsupported-format {
                background-color: white;
                border-radius: 5px;
                font-size: 25px;
                height: 100%;
                margin: auto;
                text-align: center;
                /* If width == 100%, buttons cover text */
                width: 70%;
            }

            //

            > #fullscreen-filename {
                border-radius: 3px;
                color: #ffffffa0;
                margin: auto;
                margin-top: 5px;
                width: fit-content;
            }
        }

        > #info {
            background-color: #f7f7f7;
            border-radius: 5px;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            overflow-y: auto;

            // Info blocks

            > div.card {
                background-color: white;
                border: 1px solid #00000012;
                border-bottom: 1px solid #00000060;
                border-radius: 3px;
                margin: 5px;
                margin-bottom: 7px;
                padding: 3px;

                &:last-child {
                    margin-bottom: 30px;
                }

                > div.header {
                    border-bottom: 1px solid #00000060;
                    border-radius: 3px;
                    font-size: 18px;
                    margin: auto;
                    position: relative;
                    text-align: center;

                    > i {
                        cursor: pointer;
                        font-size: 20px;
                        position: absolute;
                        right: 0;
                        top: 0;
                    }
                }

                > div.data {
                    font-size: 14px;
                    padding: 5px;
                    word-wrap: break-word;

                    > i.in-trash-mark {
                        font-size: 16px;
                    }
                }
            }
        }
    }
}
</style>


<script lang="ts">
import Vue from "vue";
// Components
import TagComponent from "@components/Tag/Tag.vue";
import LoaderComponent from "@app/global/components/Loader/Loader.vue";
// Classes and types
import { File } from "@app/global/classes";
// Shared data
import SharedState, { setShowDropLayer, setShowPreviewWindow } from "@app/index/state";
import SharedStore from "@app/index/store";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import { Params } from "@app/global";
import { logError, preloadImages } from "@app/index/utils";
import { ConvertBytesToString } from "@app/global/utils";
import { Const, DateformatMask } from "@app/global/const";
import dateformat from "dateformat";
import API from "@app/index/api";

export default Vue.extend({
    data: function() {
        return {
            show: false,
            showAsText: false,
            fullscreenMode: false,
            // File
            fileIndex: 0,
            file: null as File | null,
            // Data
            textFileContent: "",
            //
            Store: SharedStore.state,
            State: SharedState.state
        };
    },
    computed: {
        allFiles: function(): Array<File> {
            // For reactive updating (see @app/index/store/types.ts for more information)
            const reactive = this.Store.allFilesChangesCounter;
            return this.Store.allFiles;
        },
        originLink: function(): string {
            let params = "";
            if (this.State.shareMode) {
                params = "?shareToken=" + this.State.shareToken;
            }

            return Params.Host + "/" + this.file!.origin + params;
        },
        // Styles
        previewWindowStyle: function(): any {
            if (!this.fullscreenMode) {
                return {};
            }

            return {
                display: "block",
                "background-color": "#000000ee",
                "border-radius": "0px",
                height: "100%",
                "max-width": "none",
                width: "100%"
            };
        },
        previewStyle: function(): any {
            if (!this.fullscreenMode) {
                return {};
            }

            return {
                height: "90%",
                margin: "auto",
                "margin-top": "30px",
                width: "96%"
            };
        },
        switchButtonStyle: function(): any {
            if (!this.isTextFile) {
                return {};
            }

            return {
                width: "14%"
            };
        },
        //
        showAuthOnlyElement: function(): boolean {
            return this.State.user.authorized;
        },
        // Types
        isTextFile: function(): boolean {
            return this.file !== null && (this.file.type.previewType === Const.previewTypes.text || this.showAsText);
        },
        isImage: function(): boolean {
            return this.file !== null && this.file.type.previewType === Const.previewTypes.image;
        },
        isAudio: function(): boolean {
            let res = this.file !== null && this.file.type.previewType.includes(Const.previewTypes.audio);
            if (res) {
                let audio = this.$refs["audio-block"] as HTMLAudioElement;
                if (audio !== undefined) {
                    // We have to reload video with new src
                    this.$nextTick(() => {
                        audio.load();
                    });
                }
            }
            return res;
        },
        isVideo: function(): boolean {
            let res = this.file !== null && this.file.type.previewType.includes(Const.previewTypes.video);
            if (res) {
                let video = this.$refs["video-block"] as HTMLVideoElement;
                if (video !== undefined) {
                    // We have to reload video with new src
                    this.$nextTick(() => {
                        video.load();
                    });
                }
            }
            return res;
        },
        //
        fileSize: function(): string {
            return ConvertBytesToString(this.file!.size);
        },
        fileAddTime(): string {
            return dateformat(this.file!.addTime, DateformatMask);
        }
    },
    //
    components: {
        tag: TagComponent,
        loader: LoaderComponent
    },
    //
    created: function() {
        EventBus.$on(Events.ShowPreview, (payload: any) => {
            if (payload === undefined || !(payload.file instanceof File)) {
                /* eslint-disable no-console */
                console.error("Events.ShowPreview: payload isn't valid:", payload);
                /* eslint-enable no-console */
                return;
            }

            this.file = payload.file;

            // Define fileIndex
            for (let i = 0; i < this.Store.allFiles.length; i++) {
                if (this.Store.allFiles[i].id === this.file!.id) {
                    this.fileIndex = i;
                    break;
                }
            }

            this.textFileContent = "";
            if (this.isTextFile) {
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

        // This handler let update Preview when a file was changed
        EventBus.$on(Events.ModalWindow.HideWindow, () => {
            if (this.file === null || !this.show) {
                return;
            }

            // A request already has been sent when ModalWindow was closed, but we have to wait for a response

            const intervalTime = 100, // in ms
                maxTime = 5000; // 5s
            let pastTime = 0, // in ms
                oldFileID = this.file.id,
                oldCounter = this.Store.allFilesChangesCounter;

            let intervalID = setInterval(() => {
                pastTime += intervalTime;
                if (pastTime > maxTime) {
                    // timeout, clear resources
                    clearInterval(intervalID);
                }

                if (this.file === null || oldFileID !== this.file.id) {
                    // User can switch a file. Clear interval in this case.
                    clearInterval(intervalID);
                    return;
                }

                if (this.Store.allFilesChangesCounter !== oldCounter) {
                    clearInterval(intervalID);
                    // Changes were fetched, can update preview
                    this.updatePreview();
                }
            }, intervalTime);
        });
    },
    watch: {
        file: {
            immediate: true,
            handler: function() {
                // Reset on file change
                this.showAsText = false;
            }
        }
    },
    //
    methods: {
        window() {
            return {
                show: () => {
                    setShowPreviewWindow(true);
                    setShowDropLayer(false);
                    document.addEventListener("keydown", this.onkeydownListener);
                    this.show = true;
                },
                hide: () => {
                    setShowPreviewWindow(false);
                    setShowDropLayer(true);
                    document.removeEventListener("keydown", this.onkeydownListener);
                    this.fullscreenMode = false;
                    this.show = false;
                }
            };
        },
        edit() {
            return {
                filename: () => {
                    EventBus.$emit(Events.ModalWindow.RegularMode.ShowFileRenamingWindow, { file: this.file });
                },
                tags: () => {
                    EventBus.$emit(Events.ModalWindow.RegularMode.ShowTagsChangingWindow, { file: this.file });
                },
                description: () => {
                    EventBus.$emit(Events.ModalWindow.RegularMode.ShowFileDescriptionChangingWindow, {
                        file: this.file
                    });
                }
            };
        },
        nextPreview() {
            if (this.fileIndex < this.Store.allFiles.length - 1) {
                this.file = this.Store.allFiles[++this.fileIndex];
                if (this.fileIndex < this.Store.allFiles.length - 1) {
                    let nextFile = this.Store.allFiles[this.fileIndex + 1];
                    if (nextFile.type.previewType == Const.previewTypes.image) {
                        preloadImages(nextFile.origin);
                    }
                }

                if (this.isTextFile) {
                    this.setPreviewText();
                }
            }
        },
        previousPreview() {
            if (this.fileIndex > 0) {
                this.file = this.Store.allFiles[--this.fileIndex];
                if (this.fileIndex > 0) {
                    let nextFile = this.Store.allFiles[this.fileIndex - 1];
                    if (nextFile.type.previewType == Const.previewTypes.image) {
                        preloadImages(nextFile.origin);
                    }
                }

                if (this.isTextFile) {
                    this.setPreviewText();
                }
            }
        },
        setPreviewText() {
            if (this.file === null) return;

            this.textFileContent = "";

            let shareToken = "";
            if (SharedState.state.shareMode) {
                shareToken = "shareToken=" + SharedState.state.shareToken;
            }

            fetch(Params.Host + "/" + this.file.origin + "?" + shareToken, {
                method: "GET",
                credentials: "same-origin"
            })
                .then(resp => resp.text())
                .then(text => (this.textFileContent = text))
                .catch(err => logError(err));
        },
        openAsTextFile() {
            this.showAsText = true;
            this.setPreviewText();
        },
        updatePreview() {
            if (this.file === null) {
                return;
            }

            for (let i = 0; i < this.Store.allFiles.length; i++) {
                if (this.Store.allFiles[i].id === this.file.id) {
                    // Updating fileIndex is confusing. So it's better not to change it
                    // this.fileIndex = i;
                    this.file = this.Store.allFiles[i];
                    break;
                }
            }
        },
        onkeydownListener(event: KeyboardEvent) {
            if (this.State.showModalWindow) {
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
});
</script>
