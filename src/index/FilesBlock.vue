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
import Component from "vue-class-component";
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
import { isElementInPath, preloadImages } from "@app/index/tools";

const trTableHeight = 50;
const maxLastIDs = 10;

let areEqualArrays = (a: any[], b: any[]): boolean => {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
};

@Component({
    components: {
        file: FileComponent,
        RecycleScroller: RecycleScroller
    }
})
export default class extends Vue {
    // We want to update offset when number or order of files were changed.
    // We can't emit event in TopBar search functions to update offset
    // because it would emit event after every file change. We would prefer not to update
    // offset when only files data were changed. So we have to have special vars to
    // determine were order or number of files changed.
    lastAllFilesLength: number = 0;
    lastFirstFilesIDS: number[] = []; // last maxLastIDs ids
    //
    // For select mode
    allSelected: boolean = false;
    selectedFilesCounter: number = 0;
    //
    // Sort modes
    sortModeByName: boolean = true;
    sortModeBySize: boolean = false;
    sortModeByTime: boolean = false;
    //
    sortOrderAsc: boolean = true;
    sortOrderDesc: boolean = false;
    //
    lastSortType: string = Const.sortType.name;
    //
    readonly Store = SharedStore.state;

    get allFiles(): TableFile[] {
        // Reset because allFiles will change
        this.allSelected = false;
        this.selectedFilesCounter = 0;

        // For reactive updating (see @app/index/store/types.ts for more information)
        let reactive = this.Store.allFilesChangesCounter;

        let allFiles: TableFile[] = [];
        this.Store.allFiles.forEach((f, i) => {
            if (!f.deleted || SharedState.state.settings.showDeletedFiles) {
                allFiles.push(new TableFile(f));
            }
        });

        // Determine should we reset offset
        if (allFiles.length !== this.lastAllFilesLength) {
            this.lastAllFilesLength = allFiles.length;
            this.lastFirstFilesIDS = [];
            for (let i = 0; i < maxLastIDs && i < allFiles.length; i++) {
                this.lastFirstFilesIDS.push(allFiles[i].id);
            }
        } else {
            let newIDs: number[] = [];
            for (let i = 0; i < maxLastIDs && i < allFiles.length; i++) {
                newIDs.push(allFiles[i].id);
            }

            if (!areEqualArrays(newIDs, this.lastFirstFilesIDS)) {
                // We are able not to change lastAllFilesLength
                this.lastFirstFilesIDS = [];
                for (let i = 0; i < maxLastIDs && i < allFiles.length; i++) {
                    this.lastFirstFilesIDS.push(allFiles[i].id);
                }
            }
        }

        return allFiles;
    }

    created() {
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
    }

    // Sorts
    sort() {
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
    }

    // Select mode
    toggleAllFiles() {
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
    }

    unselectAllFiles() {
        this.selectedFilesCounter = 0;
        this.allFiles.forEach((f, i) => {
            this.allFiles[i].selected = false;
        });

        this.allSelected = false;
        SharedState.commit("unsetSelectMode");
    }

    // updateSelectedFiles updates list of selectedFiles
    updateSelectedFiles() {
        let selectedFiles: File[] = [];

        this.allFiles.forEach((f, i) => {
            if (this.allFiles[i].selected) {
                selectedFiles.push(f);
            }
        });

        SharedStore.commit("setSelectedFiles", selectedFiles);
    }

    // For children
    selectFile(id: number) {
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
    }

    unselectFile(id: number) {
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
</script>
