<template>
<div id="files-block-wrapper">
<div style="height: 100%;">
	<div
		class="file-info"
		style="font-size: 17px; border-bottom: 1px solid grey; padding-right: 10px;"
	>
		<!-- There are some nonexistent classes. They are reserved for readability and future using -->
		<div class="file-info__checkbox">
			<div>
				<input
					type="checkbox"
					style="height: 15px; width: 15px;"
					title="Select all"
					v-model="allSelected"
					:indeterminate.prop="
						selectedFilesCounter > 0 &&
						selectedFilesCounter !== allFiles.length"
					@click="toggleAllFiles">
			</div>
		</div>

		<div
			class="file-info__preview"
			style="cursor: default;"
			title="Selected files"
		>{{selectedFilesCounter}}</div>

		<div class="file-info__filename">
			Filename
			<i
				id="sortByNameIcon"
				class="material-icons noselect"
				style="font-size: 20px; cursor: pointer;"
				@click="sort().byName()"
				:style="[!sortModeByName || sortOrderAsc || !sortOrderDesc ? {'transform': 'scale(1, -1)'} : {'transform': 'scale(1, 1)'}]"
			>sort</i>
		</div>

		<div class="file-info__tags-list">Tags</div>

		<div class="file-info__description">Description</div>

		<div class="file-info__size">
			File size
			<i
				id="sortByNameSize"
				class="material-icons noselect"
				style="transform: scale(1, 1); font-size: 20px; cursor: pointer;"
				@click="sort().bySize()"
				:style="[!sortModeBySize || sortOrderAsc || !sortOrderDesc ? {'transform': 'scale(1, -1)'} : {'transform': 'scale(1, 1)'}]"
			>sort</i>
		</div>

		<div class="file-info__adding-time">
			Time of adding
			<i
				id="sortByNameTime"
				class="material-icons noselect"
				style="transform: scale(1, 1); font-size: 20px; cursor: pointer;"
				@click="sort().byTime()"
				:style="[!sortModeByTime || sortOrderAsc || !sortOrderDesc ? {'transform': 'scale(1, -1)'} : {'transform': 'scale(1, 1)'}]"
			>sort</i>
		</div>
	</div>

	<RecycleScroller
		:items="allFiles"
		:item-height="50"
		id="recycle-scroller"
	>
		<div slot-scope="{ item }">
			<file :file="item"></file>
		</div>
	</RecycleScroller>
</div>
</div>
</template>

<style>
/* We have to use global styles to use some classes in File component */

#files-block-wrapper {
    height: calc(100vh - 51px);
    overflow: auto;
    overflow-x: hidden;
}

#recycle-scroller {
    /* without header */
    height: calc(100% - 51px);
}

/* Classes for File component */

.file-info {
    border-bottom: 1px solid #ddd;
    display: grid;
    grid-template-columns: 40px 60px 210px auto 20% 110px 150px;
    grid-auto-rows: 50px;
    text-align: left;
}

.file-info > div {
    height: 40px;
    line-height: 40px;
    padding: 4px;
}

.file-info__checkbox {
    text-align: center;
}

.file-info__checkbox > div {
    line-height: normal;
    transform: translateY(50%);
}
</style>


<script lang="ts">
import Vue from "vue";
// Components
import FileComponent from "@components/File/File.vue";
// There's no a declaration file for module 'vue-virtual-scroller'.
// So we have to use require() instead of import to escape error
const VirtualScroller = require("vue-virtual-scroller");
const { RecycleScroller } = VirtualScroller;
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
// Classes and types
import { File, Tag } from "@app/global/classes";
import { TableFile } from "@components/File/types";
// Shared data
import SharedStore from "@app/index/store";
import SharedState from "@app/index/state";
import { State } from "@app/index/state/types";
// Other
import { Const } from "@app/global/const";
import { Events, EventBus } from "@app/index/eventBus";
import { preloadImages } from "@app/index/utils";
import { isElementInPath } from "@app/global/utils";

export default Vue.extend({
    data: function() {
        return {
            // For select mode
            allSelected: false,
            selectedFilesCounter: 0,
            //
            // Sort modes
            sortModeByName: true,
            sortModeBySize: false,
            sortModeByTime: false,
            //
            sortOrderAsc: true,
            sortOrderDesc: false,
            //
            lastSortType: Const.sortType.name,
            //
            Store: SharedStore.state
        };
    },
    computed: {
        allFiles: function(): TableFile[] {
            // For reactive updating (see @app/index/store/types.ts for more information)
            let reactive = this.Store.allFilesChangesCounter;

            let allFiles: TableFile[] = [];
            this.Store.allFiles.forEach((f, i) => {
                if (!f.deleted || SharedState.state.settings.showDeletedFiles) {
                    allFiles.push(new TableFile(f));
                }
            });

            return allFiles;
        }
    },
    //
    components: {
        file: FileComponent,
        RecycleScroller: RecycleScroller
    },
    //
    created: function() {
        EventBus.$on(Events.FilesBlock.UnselectAllFiles, () => {
            this.unselectAllFiles();
        });
        EventBus.$on(Events.UpdateSelectedFiles, () => {
            this.updateSelectedFiles();
        });
        //
        EventBus.$on(Events.FilesBlock.SelectFile, (payload: any) => {
            if (payload.id === undefined) {
                return;
            }
            this.selectFile(<number>payload.id);
        });
        EventBus.$on(Events.FilesBlock.UnselectFile, (payload: any) => {
            if (payload.id === undefined) {
                return;
            }
            this.unselectFile(<number>payload.id);
        });
        //
        EventBus.$on(Events.FilesBlock.RestoreSortParams, () => {
            this.sort().restoreDefault();
        });
    },
    //
    methods: {
        // Sorts
        sort: function() {
            return {
                byName: () => {
                    if (this.lastSortType === Const.sortType.name) {
                        // Just invert order
                        this.sortOrderAsc = !this.sortOrderAsc;
                        this.sortOrderDesc = !this.sortOrderDesc;
                    } else {
                        this.sortOrderAsc = true;
                        this.sortOrderDesc = false;
                    }
                    this.sortModeByName = true;
                    this.sortModeBySize = false;
                    this.sortModeByTime = false;
                    this.lastSortType = Const.sortType.name;

                    let type = this.lastSortType,
                        order = this.sortOrderAsc ? Const.sortOrder.asc : Const.sortOrder.desc;

                    EventBus.$emit(Events.Search.Advanced, { type: type, order: order });
                },
                bySize: () => {
                    if (this.lastSortType === Const.sortType.size) {
                        // Just invert order
                        this.sortOrderAsc = !this.sortOrderAsc;
                        this.sortOrderDesc = !this.sortOrderDesc;
                    } else {
                        this.sortOrderAsc = true;
                        this.sortOrderDesc = false;
                    }
                    this.sortModeByName = false;
                    this.sortModeBySize = true;
                    this.sortModeByTime = false;

                    this.lastSortType = Const.sortType.size;

                    let type = this.lastSortType,
                        order = this.sortOrderAsc ? Const.sortOrder.asc : Const.sortOrder.desc;

                    EventBus.$emit(Events.Search.Advanced, { type: type, order: order });
                },
                byTime: () => {
                    if (this.lastSortType === Const.sortType.time) {
                        // Just invert order
                        this.sortOrderAsc = !this.sortOrderAsc;
                        this.sortOrderDesc = !this.sortOrderDesc;
                    } else {
                        this.sortOrderAsc = true;
                        this.sortOrderDesc = false;
                    }
                    this.sortModeByName = false;
                    this.sortModeBySize = false;
                    this.sortModeByTime = true;
                    this.lastSortType = Const.sortType.time;

                    let type = this.lastSortType,
                        order = this.sortOrderAsc ? Const.sortOrder.asc : Const.sortOrder.desc;

                    EventBus.$emit(Events.Search.Advanced, { type: type, order: order });
                },
                restoreDefault: () => {
                    this.sortModeByName = true;
                    this.sortModeBySize = false;
                    this.sortModeByTime = false;
                    //
                    this.sortOrderAsc = true;
                    this.sortOrderDesc = false;
                }
            };
        },
        // Select mode
        toggleAllFiles: function() {
            if (!this.allSelected) {
                this.selectedFilesCounter = this.allFiles.length;
                this.allSelected = true;
                SharedState.commit("setSelectMode");

                this.allFiles.forEach((f, i) => {
                    this.allFiles[i].selected = true;
                });
            } else {
                this.unselectAllFiles();
            }
        },
        unselectAllFiles: function() {
            this.selectedFilesCounter = 0;
            this.allFiles.forEach((f, i) => {
                this.allFiles[i].selected = false;
            });

            this.allSelected = false;
            SharedState.commit("unsetSelectMode");
        },
        // updateSelectedFiles updates list of selectedFiles
        updateSelectedFiles: function() {
            let selectedFiles: File[] = [];

            this.allFiles.forEach((f, i) => {
                if (this.allFiles[i].selected) {
                    selectedFiles.push(f);
                }
            });

            SharedStore.commit("setSelectedFiles", selectedFiles);
        },
        // For children
        selectFile: function(id: number) {
            this.selectedFilesCounter++;
            SharedState.commit("setSelectMode");

            for (let i = 0; i < this.allFiles.length; i++) {
                if (this.allFiles[i].id === id) {
                    this.allFiles[i].selected = true;
                }
            }

            if (this.selectedFilesCounter === this.allFiles.length) {
                this.allSelected = true;
            }
        },
        unselectFile: function(id: number) {
            this.selectedFilesCounter--;
            this.allSelected = false;
            for (let i = 0; i < this.allFiles.length; i++) {
                if (this.allFiles[i].id === id) {
                    this.allFiles[i].selected = false;
                }
            }

            if (this.selectedFilesCounter === 0) {
                SharedState.commit("unsetSelectMode");
            }
        }
    }
});
</script>
