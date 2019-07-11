<template>
	<div id="upload-window">
		<div v-show="!uploading">
			<div id="input-wrapper">
				<input
					id="file-input"
					type="file"
					multiple
					ref="files-input"
					@change="updateFiles">

				<label for="file-input">Choose files</label>
			</div>

			<!-- Previews -->
			<div id="previews-list">
				<div
					v-for="(file, index) in files"
					:key="index"
					class="file-preview"
				>
					<!-- Just trigger preview loading -->
					{{ setFilePreview(file) }}
					<img :id="'preview-'+file.name">
					<br>
					<span>{{ file.name }}</span>
				</div>
			</div>

			<!-- Tags -->
			<div
				v-if="canUploadSomething"
				id="tags-list">
				<div
					v-for="(id, index) in allTagsIDs"
					:key="index"
					class="list-element"
				>
					<div class="tag">
						<tag :tag="Store.allTags.get(id)"></tag>
					</div>

					<div class="checkbox">
						<input
							type="checkbox"
							@click="updateTagsList(id)">
					</div>
				</div>
			</div>

			<!-- Upload button -->
			<div
				v-if="canUploadSomething"
				id="upload-button"
				@click="upload"
			>
				<svg viewBox="0 0 24 24">
					<path fill="#000000" d="M9,10V16H15V10H19L12,3L5,10H9M12,5.8L14.2,8H13V14H11V8H9.8L12,5.8M19,18H5V20H19V18Z" />
				</svg>
				<span>Upload</span>
			</div>
		</div>

		<div v-show="uploading">
			<div id="status-bar">
				<div
					id="progress-bar"
					:style="{width: uploadPercentage + '%'}"
				></div>
			</div>
		</div>
	</div>
</template>


<style lang="scss" scoped>
div#input-wrapper {
    margin: 10px auto 15px;
    padding: 5px;
    width: fit-content;

    input {
        display: none;
    }

    label {
        border: 1px solid #888888;
        border-radius: 5px;
        padding: 5px;

        &:active {
            background-color: #ebebeb;
        }
    }
}

div#previews-list {
    display: flex;
    overflow-x: auto;
    padding-bottom: 10px;
    margin: 0 auto 15px;
    max-width: 95%;
    width: fit-content;

    div.file-preview {
        border: 1px solid #88888840;
        border-radius: 5px;
        margin-right: 10px;
        padding: 5px;
        text-align: center;

        &:last-child {
            margin-right: 0;
        }

        img {
            height: 180px;
            width: auto;
        }

        span {
            word-break: break-all;
        }
    }
}

div#tags-list {
    margin: auto;
    width: fit-content;

    div.list-element {
        display: flex;
        margin-bottom: 5px;
        justify-content: space-between;
        width: 200px;

        div.tag {
            display: flex;
        }

        div.checkbox {
            font-size: 20px;
        }
    }
}

div#upload-button {
    $size: 36px;

    border: 1px solid #88888880;
    border-radius: 3px;
    display: flex;
    font-size: 18px;
    height: $size;
    line-height: $size;
    margin: 20px auto;
    padding: 3px 5px 3px 3px;
    width: fit-content;

    &:active {
        background-color: #dcdcdc70;
    }

    svg {
        height: $size;
        width: $size;
    }
}

div#status-bar {
    background-color: white;
    border: 1px solid #888888;
    border-radius: 10px;
    box-sizing: border-box;
    height: 25px;
    margin: 40px auto;
    width: 250px;
    padding: 3px;

    div#progress-bar {
        background-color: #dc143c;
        border-radius: 10px;
        height: 100%;
    }
}
</style>


<script lang="ts">
import Vue from "vue";
// Components and classes
import TagComponent from "./Tag.vue";
// Shared data
import SharedStore from "@app/mobile/store";
// Other
import { Params } from "@app/global";
import { IsErrorStatusCode } from "@app/global/utils";
import { EventBus, Events } from "@app/mobile/eventBus";
import axios from "axios";

function logError(msg: string) {
    alert("[ERR] " + msg);
}

export default Vue.extend({
    data: function() {
        return {
            files: [] as Array<File>,
            tags: new Set() as Set<number>,
            //
            uploading: false,
            uploadPercentage: 0,
            //
            Store: SharedStore.state
        };
    },
    computed: {
        canUploadSomething: function(): boolean {
            return this.files.length > 0;
        },
        allTagsIDs: function(): Array<number> {
            // For reactive updating (see @app/index/store/types.ts for more information)
            const reactive = this.Store.allTagsChangesCounter;

            return Array.from(this.Store.allTags.keys());
        }
    },
    //
    components: {
        tag: TagComponent
    },
    //
    methods: {
        updateFiles() {
            let input = this.$refs["files-input"] as HTMLInputElement;
            if (input === undefined) {
                return;
            }

            let files = input.files;
            if (files === null) {
                return;
            }
            this.files = [];

            for (let i = 0; i < files.length; i++) {
                let file = files.item(i);
                if (file === null) {
                    continue;
                }
                this.files.push(file);
            }
        },
        setFilePreview(file: File) {
            if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/gif") {
                // Load preview
                let reader = new FileReader();
                reader.readAsDataURL(file);

                this.$nextTick(() => {
                    reader.onloadend = () => {
                        // An element already exists, when file is loaded
                        let elem = document.getElementById("preview-" + file.name) as HTMLImageElement;
                        if (elem !== undefined) {
                            elem.src = reader.result as string;
                        }
                    };
                });
            } else {
                // Load extension preview
                this.$nextTick(() => {
                    let elem = document.getElementById("preview-" + file.name) as HTMLImageElement;
                    if (elem !== undefined) {
                        elem.src = Params.Host + "/ext/" + file.name.split(".").pop();
                    }
                });
            }
        },
        updateTagsList(id: number) {
            if (!this.tags.has(id)) {
                this.tags.add(id);
            } else {
                this.tags.delete(id);
            }
        },
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

            var config = {
                onUploadProgress: (ev: ProgressEvent) => {
                    this.uploadPercentage = Math.round((ev.loaded / ev.total) * 100);
                }
            };

            // We use axios to update progress bar correctly
            axios
                .post(Params.Host + "/api/files?tags=" + tags, formData, config)
                .then(resp => {
                    this.uploading = false;

                    if (IsErrorStatusCode(resp.status)) {
                        logError("Can't upload files:" + resp.data);
                        this.closeWindow();
                        return;
                    }

                    // Reset scroll
                    EventBus.$emit(Events.resetFilesBlockScroll);
                    // Update list of files
                    EventBus.$emit(Events.refreshFiles);

                    return resp.data;
                })
                .then(log => {
                    if (log === undefined) {
                        this.closeWindow();
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
                        if (!log[i].isError) {
                            continue;
                        }

                        logError(log[i].filename + ": " + log[i].error);
                    }
                    this.closeWindow();
                })
                .catch(err => {
                    this.uploading = false;
                    logError(err);
                    this.closeWindow();
                });
        },
        closeWindow() {
            this.$parent.$emit("close-bar");
        }
    }
});
</script>
