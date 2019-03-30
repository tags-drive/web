<template>
	<div
		id="context-menu"
		v-if="show"
		:style="{'top': top + 'px', 'left': left + 'px'}"
	>
		<div>
			<!-- Rename -->
			<div v-if="!State.selectMode">
				<input type="button" class="btn" @click="regularMode().changeName()" value="Rename">
			</div>
			<!-- Tags -->
			<div v-if="!State.selectMode">
				<input type="button" class="btn" @click="regularMode().changeTags()" value="Update tags">
			</div>
			<div v-else>
				<input type="button" class="btn" @click="selectMode().addTags()" value="Add tags">
				<input type="button" class="btn" @click="selectMode().deleteTags()" value="Delete tags">
			</div>
			<!-- Description -->
			<div v-if="!State.selectMode">
				<input type="button" class="btn" @click="regularMode().changeDescription()" value="Update description">
			</div>
			<!-- Download -->
			<div v-if="!State.selectMode">
				<input type="button" class="btn" @click="selectMode().downloadSingleFile()" value="Download">
			</div>
			<div v-else>
				<input type="button" class="btn" @click="selectMode().downloadFiles()" value="Download selected files">
			</div>
			<!-- Delete -->
			<div v-if="!State.selectMode">
				<input type="button" class="btn" @click="regularMode().deleteFile()" value="Delete menu" style="margin-bottom: 0px;">
			</div>
			<div v-else>
				<input type="button" class="btn" @click="selectMode().deleteFiles()" value="Delete menu" style="margin-bottom: 0px;">
			</div>
		</div>
	</div>
</template>


<style scoped>
#context-menu {
    background-color: #ffffff;
    border: 1px solid #b2b2b2;
    border-radius: 5px;
    padding: 5px;
    position: fixed;
    text-align: center;
    z-index: 4;
}

.btn {
    background-color: white;
    border: 1px solid #b2b2b2;
    border-radius: 2px;
    cursor: pointer;
    margin-bottom: 3px;
    outline: none;
    width: 100%;
}

.btn:hover {
    background-color: #e5e5e5;
}

.btn--href {
    /* Same as input */
    color: black;
    display: block;
    font-family: Arial;
    font-size: 13.3333px;
    font-stretch: normal;
    font-style: normal;
    font-variant-caps: normal;
    font-variant-east-asian: normal;
    font-variant-ligatures: normal;
    font-variant-numeric: normal;
    font-weight: 400;
    line-height: normal;
    text-decoration: none;
}
</style>


<script lang="ts">
import Vue from "vue";
// Classes and types
import { File } from "@app/global/classes";
// Shared data
import SharedStore from "@app/index/store";
import SharedState from "@app/index/state";
import { State } from "@app/index/state/types";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import { isElementInPath } from "@app/index/tools";
import API from "@app/index/api";

interface Payload {
    file: File;
    x: number;
    y: number;
}

function getSelectedFiles(): Promise<File[]> {
    // Set SharedStore.state.selectedFilesReady to false
    SharedStore.commit("clearSelectedFiles");

    EventBus.$emit(Events.UpdateSelectedFiles);

    return new Promise<File[]>(function(resolve, reject) {
        let t = setInterval(() => {
            if (SharedStore.state.selectedFilesReady) {
                resolve(SharedStore.state.selectedFiles);
                clearInterval(t);
            }
        }, 20);
    });
}

export default Vue.extend({
    data: function() {
        return {
            file: <File | null>null,
            // Style
            top: 0,
            left: 0,
            show: false,
            // For calculation of position
            divWidth: 140,
            divHeight: 125,
            //
            State: SharedState.state
        };
    },
    //
    created() {
        EventBus.$on(Events.ShowContextMenu, (payload: Payload) => {
            this.setFile(payload.file);
            this.showMenu(payload.x, payload.y);
        });

        document.addEventListener("click", event => {
            if (this.show && !isElementInPath(event, "context-menu")) {
                this.hideMenu();
            }
        });
    },
    methods: {
        setFile: function(file: File) {
            this.file = file;
        },
        showMenu: function(x: number, y: number) {
            const offset = 10;
            x += offset;
            y += offset;
            if (x + this.divWidth > window.innerWidth) {
                x -= offset * 2;
                x -= this.divWidth;
            }
            if (y + this.divHeight > window.innerHeight) {
                y -= offset * 2;
                y -= this.divHeight;
            }
            this.left = x;
            this.top = y;
            this.show = true;

            document.addEventListener("wheel", this.scrollHandler);
        },
        hideMenu: function() {
            document.removeEventListener("wheel", this.scrollHandler);

            this.show = false;
            EventBus.$emit(Events.FilesBlock.UnfocusFile);
        },
        // Options of context menu
        regularMode: function() {
            return {
                changeName: () => {
                    this.hideMenu();
                    EventBus.$emit(Events.ModalWindow.RegularMode.ShowFileRenamingWindow, { file: this.file });
                },
                changeTags: () => {
                    this.hideMenu();
                    EventBus.$emit(Events.ModalWindow.RegularMode.ShowTagsChangingWindow, { file: this.file });
                },
                changeDescription: () => {
                    this.hideMenu();
                    EventBus.$emit(Events.ModalWindow.RegularMode.ShowFileDescriptionChangingWindow, {
                        file: this.file
                    });
                },
                deleteFile: () => {
                    this.hideMenu();
                    EventBus.$emit(Events.ModalWindow.RegularMode.ShowFileDeletingWindow, { file: this.file });
                }
            };
        },
        // Options of context menu (select mode)
        selectMode: function() {
            return {
                addTags: () => {
                    this.hideMenu();
                    getSelectedFiles().then(files =>
                        EventBus.$emit(Events.ModalWindow.SelectMode.ShowTagsAddingWindow, { files: files })
                    );
                },
                deleteTags: () => {
                    this.hideMenu();
                    getSelectedFiles().then(files =>
                        EventBus.$emit(Events.ModalWindow.SelectMode.ShowTagsDeletingWindow, { files: files })
                    );
                },
                downloadSingleFile: () => {
                    API.files.downloadFile(this.file!.id, this.file!.filename);
                },
                downloadFiles: () => {
                    getSelectedFiles().then(files => {
                        let ids: number[] = [];
                        files.forEach(elem => ids.push(elem.id));
                        API.files.downloadFiles(ids);
                        EventBus.$emit(Events.FilesBlock.UnselectAllFiles);
                    });
                },
                deleteFiles: () => {
                    this.hideMenu();
                    getSelectedFiles().then(files =>
                        EventBus.$emit(Events.ModalWindow.SelectMode.ShowFilesDeletingWindow, { files: files })
                    );
                }
            };
        },
        // scrollHandler prevents scrolling when Context Menu is displayed
        scrollHandler: function(ev: WheelEvent) {
            if (this.show) {
                ev.preventDefault();
            }
        }
    }
});
</script>
