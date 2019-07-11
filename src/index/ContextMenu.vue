<template>
	<div
		id="context-menu"
		v-if="show"
		:style="{'top': top + 'px', 'left': left + 'px'}"
	>
		<!-- Rename -->
		<div
			v-if="!State.selectMode"
			class="menu-button"
			:class="{ 'auth-only-element': !showAuthOnlyElement }"
		>
			<input type="button" class="btn" @click="regularMode().changeName()" value="Rename">
		</div>
		<!-- Tags -->
		<div
			class="menu-button"
			:class="{ 'auth-only-element': !showAuthOnlyElement }"
		>
			<!-- Usual mode -->
			<input
				v-if="!State.selectMode"
				type="button"
				class="btn"
				@click="regularMode().changeTags()"
				value="Update tags">

			<!-- Select mode -->
			<input
				v-if="State.selectMode"
				type="button"
				class="btn"
				@click="selectMode().addTags()"
				value="Add tags">

			<input
				v-if="State.selectMode"
				type="button"
				class="btn"
				@click="selectMode().deleteTags()"
				value="Delete tags">
		</div>
		<!-- Description -->
		<div
			v-if="!State.selectMode"
			class="menu-button"
			:class="{ 'auth-only-element': !showAuthOnlyElement }"
		>
			<input type="button" class="btn" @click="regularMode().changeDescription()" value="Update description">
		</div>
		<!-- Download -->
		<div class="menu-button">
			<input
				v-if="!State.selectMode"
				type="button"
				class="btn"
				@click="regularMode().downloadFile()"
				value="Download">
			<input
				v-else
				type="button"
				class="btn"
				@click="selectMode().downloadFiles()"
				value="Download selected files">
		</div>
		<!-- Share -->
		<div
			class="menu-button"
			:class="{ 'auth-only-element': !showAuthOnlyElement }"
		>
			<input
				v-if="!State.selectMode"
				type="button"
				class="btn"
				@click="regularMode().shareFile()"
				value="Share file">
			<input
				v-else
				type="button"
				class="btn"
				@click="selectMode().shareFiles()"
				value="Share selected files">
		</div>
		<!-- Delete -->
		<div
			class="menu-button"
			:class="{ 'auth-only-element': !showAuthOnlyElement }"
		>
			<input
				v-if="!State.selectMode"
				type="button"
				class="btn"
				@click="regularMode().deleteFile()"
				value="Delete menu">
			<input
				v-else
				type="button"
				class="btn"
				@click="selectMode().deleteFiles()"
				value="Delete menu">
		</div>
	</div>
</template>


<style lang="scss" scoped>
#context-menu {
    background-color: #ffffff;
    border: 1px solid #b2b2b2;
    border-radius: 5px;
    padding: 5px;
    position: fixed;
    text-align: center;
    z-index: 4;

    > div.menu-button {
        $margin: 3px;

        background-color: white;
        margin-bottom: $margin;

        &:last-child {
            margin-bottom: 0;
        }

        > input.btn {
            border: 1px solid #b2b2b2;
            border-radius: 2px;
            cursor: pointer;
            margin-bottom: $margin;
            outline: none;
            width: 100%;

            &:last-child {
                margin-bottom: 0;
            }

            &:hover {
                background-color: #e5e5e5;
            }
        }
    }
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
import { IsElementInPath } from "@app/global/utils";
import { logInfo } from "./utils";
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
            file: null as File | null,
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
    computed: {
        showAuthOnlyElement: function(): boolean {
            return this.State.user.authorized;
        }
    },
    //
    created() {
        EventBus.$on(Events.ShowContextMenu, (payload: Payload) => {
            this.setFile(payload.file);
            this.showMenu(payload.x, payload.y);
        });

        document.addEventListener("click", event => {
            if (this.show && !IsElementInPath(event, "context-menu")) {
                this.hideMenu();
            }
        });
    },
    //
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
                downloadFile: () => {
                    this.hideMenu();

                    API.files.downloadFile(this.file!.id, this.file!.filename);
                },
                shareFile: () => {
                    this.hideMenu();

                    API.files.share(this.file!.id);
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
                downloadFiles: () => {
                    this.hideMenu();

                    getSelectedFiles().then(files => {
                        let ids: number[] = [];
                        files.forEach(elem => ids.push(elem.id));

                        // Unselect files before downloading because this process can take a long time
                        EventBus.$emit(Events.FilesBlock.UnselectAllFiles);

                        logInfo("Please, wait. Creating of an archive can take some time.");
                        API.files.downloadFiles(ids);
                    });
                },
                shareFiles: () => {
                    this.hideMenu();

                    getSelectedFiles().then(files => {
                        EventBus.$emit(Events.FilesBlock.UnselectAllFiles);

                        let ids = Array<number>(files.length);
                        for (let i = 0; i < files.length; i++) {
                            ids[i] = files[i].id;
                        }

                        API.files.share(...ids);
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
