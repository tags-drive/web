<template>
	<div
		id="context-menu"
		v-if="show"
		:style="{'top': top, 'left': left}"
	>
		<div v-on-clickaway="hideMenu">
			<!-- Rename -->
			<div v-if="!SharedState.state.selectMode">
				<input type="button" class="btn" @click="regularMode().changeName()" value="Rename">
			</div>
			<!-- Tags -->
			<div v-if="!SharedState.state.selectMode">
				<input type="button" class="btn" @click="regularMode().changeTags()" value="Update tags">
			</div>
			<div v-else>
				<input type="button" class="btn" @click="selectMode().addTags()" value="Add tags">
				<input type="button" class="btn" @click="selectMode().deleteTags()" value="Delete tags">
			</div>
			<!-- Description -->
			<div v-if="!SharedState.state.selectMode">
				<input type="button" class="btn" @click="regularMode().changeDescription()" value="Update description">
			</div>
			<!-- Download -->
			<div
				class="btn"
				style="box-sizing : border-box;"
				v-if="!SharedState.state.selectMode"
				@click="hideMenu"
			>
				<a class="btn--href" download :href="Params.Host + '/' + file.origin">Download</a>
			</div>
			<div v-else>
				<input type="button" class="btn" @click="selectMode().downloadFiles()" value="Download selected files">
			</div>
			<!-- Delete -->
			<div v-if="!SharedState.state.selectMode">
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

<script>
import VueClickaway from "vue-clickaway2";
//
import { Events, EventBus } from "./eventBus";

function getSelectedFiles() {
    this.SharedStore.commit("clearSelectedFiles");
    EventBus.$emit(Events.UpdateSelectedFiles);

    // Lock
    while (this.SharedStore.state.selectedFiles == null);

    return this.SharedStore.state.selectedFiles;
}

export default {
    mixins: [VueClickaway.mixin],
    data: function() {
        return {
            file: null,
            // Style
            top: "0px",
            left: "0px",
            show: false,
            // For calculation of position
            divWidth: 140,
            divHeight: 125
        };
    },
    mounted: function() {
        EventBus.$on(Events.ShowContextMenu, payload => {
            this.setFile(payload.file);
            this.showMenu(payload.x, payload.y);
        });
    },
    methods: {
        setFile: function(file) {
            this.file = file;
        },
        // UI
        showMenu: function(x, y) {
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
            this.left = x + "px";
            this.top = y + "px";
            this.show = true;
        },
        hideMenu: function() {
            this.show = false;
        },
        // Options of context menu
        regularMode: function() {
            return {
                changeName: () => {
                    this.show = false;
                    EventBus.$emit(Events.RegularFileRenaming, { file: this.file });
                },
                changeTags: () => {
                    this.show = false;
                    EventBus.$emit(Events.RegularTagsChanging, { file: this.file });
                },
                changeDescription: () => {
                    this.show = false;
                    EventBus.$emit(Events.RegularDescriptionChanging, { file: this.file });
                },
                deleteFile: () => {
                    this.show = false;
                    EventBus.$emit(Events.RegularFileDeleting, { file: this.file });
                }
            };
        },
        // Options of context menu (select mode)
        selectMode: function() {
            return {
                addTags: () => {
                    this.show = false;

                    let files = getSelectedFiles.call(this);
                    EventBus.$emit(Events.SelectTagsAdding, { files: files });
                },
                deleteTags: () => {
                    this.show = false;

                    let files = getSelectedFiles.call(this);
                    EventBus.$emit(Events.SelectTagsDeleting, { files: files });
                },
                downloadFiles: () => {
                    let params = new URLSearchParams();
                    let files = getSelectedFiles.call(this);

                    for (let file of files) {
                        // need to use link to a file, not filename
                        params.append("file", file.origin);
                    }

                    fetch(this.Params.Host + "/api/files/download?" + params, {
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
                },
                deleteFiles: () => {
                    this.show = false;
                    let files = getSelectedFiles.call(this);
                    EventBus.$emit(Events.SelectFilesDeleting, { files: files });
                }
            };
        }
    }
};
</script>
