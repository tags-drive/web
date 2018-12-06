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
			<div
				class="btn"
				style="box-sizing : border-box;"
				v-if="!State.selectMode"
				@click="hideMenu"
			>
				<a class="btn--href" download :href="downloadLink">Download</a>
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
    background-color: var(--primary-color);
    border: 1px solid var(--primary-border-color);
    border-radius: 5px;
    padding: 5px;
    position: fixed;
    text-align: center;
}

.btn {
    background-color: white;
    border: 1px solid var(--primary-border-color);
    border-radius: 2px;
    cursor: pointer;
    margin-bottom: 3px;
    outline: none;
    width: 100%;
}

.btn:hover {
    background-color: var(--secondary-element-color);
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
import Components from "vue-class-component";
// Shared data
import SharedStore from "./store";
import SharedState from "./state";
import { State } from "./state/types";
//
import { File } from "./global";
import { Events, EventBus } from "./eventBus";
import { Params } from "../global";

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

@Components({})
export default class extends Vue {
    file: File | null = null;
    // Style
    top: number = 0;
    left: number = 0;
    show: boolean = false;
    // For calculation of position
    divWidth: number = 140;
    divHeight: number = 125;
    //
    State: State = SharedState.state;

    get downloadLink(): string {
        if (this.file === null) {
            return "";
        }

        return Params.Host + "/" + this.file.origin;
    }

    created() {
        EventBus.$on(Events.ShowContextMenu, (payload: Payload) => {
            this.setFile(payload.file);
            this.showMenu(payload.x, payload.y);
        });

        document.addEventListener("click", event => {
            let ev = event as any;
            // We need to use type any because EventMouse hasn't property path, composedPath and composedPath().
            // Nevertheless, it's a cross browser way to get path.
            let path = ev.path || (ev.composedPath && ev.composedPath());

            for (let i in path) {
                if (path[i].id == "context-menu") {
                    return;
                }
            }

            this.hideMenu();
        });
    }

    setFile(file: File) {
        this.file = file;
    }

    showMenu(x: number, y: number) {
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
    }

    hideMenu() {
        this.show = false;
    }

    // Options of context menu
    regularMode() {
        return {
            changeName: () => {
                this.show = false;
                EventBus.$emit(Events.ModalWindow.RegularMode.ShowFileRenamingWindow, { file: this.file });
            },
            changeTags: () => {
                this.show = false;
                EventBus.$emit(Events.ModalWindow.RegularMode.ShowTagsChangingWindow, { file: this.file });
            },
            changeDescription: () => {
                this.show = false;
                EventBus.$emit(Events.ModalWindow.RegularMode.ShowFileDescriptionChangingWindow, { file: this.file });
            },
            deleteFile: () => {
                this.show = false;
                EventBus.$emit(Events.ModalWindow.RegularMode.ShowFileDeletingWindow, { file: this.file });
            }
        };
    }

    // Options of context menu (select mode)
    selectMode() {
        return {
            addTags: () => {
                this.show = false;

                getSelectedFiles().then(files =>
                    EventBus.$emit(Events.ModalWindow.SelectMode.ShowTagsAddingWindow, { files: files })
                );
            },
            deleteTags: () => {
                this.show = false;

                getSelectedFiles().then(files =>
                    EventBus.$emit(Events.ModalWindow.SelectMode.ShowTagsDeletingWindow, { files: files })
                );
            },
            downloadFiles: () => {
                let params = new URLSearchParams();

                getSelectedFiles().then(files => {
                    for (let file of files) {
                        // need to use link to a file, not filename
                        params.append("file", file.origin);
                    }

                    fetch(Params.Host + "/api/files/download?" + params, {
                        method: "GET",
                        credentials: "same-origin"
                    }).then(resp => {
                        resp.blob().then(file => {
                            let a = document.createElement("a"),
                                url = URL.createObjectURL(file);

                            a.href = url;
                            a.download = "files.zip";
                            document.body.appendChild(a);
                            a.click();

                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                        });
                    });
                });
            },
            deleteFiles: () => {
                this.show = false;
                getSelectedFiles().then(files =>
                    EventBus.$emit(Events.ModalWindow.SelectMode.ShowFilesDeletingWindow, { files: files })
                );
            }
        };
    }
}
</script>
