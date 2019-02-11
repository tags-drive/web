<template>
<div>
	<table
		id="file-table"
		style="border-collapse: collapse; width: 100%;"
	>
		<tr class="file-info">
			<th class="noselect" style="text-align: center; width: 30px;">
				<input
					type="checkbox"
					style="height: 15px; width: 15px;"
					title="Select all"
					v-model="allSelected"
					:indeterminate.prop="
						selectedFilesCounter > 0 &&
						selectedFilesCounter !== allFiles.length"
					@click="toggleAllFiles"
				></th>
			<th
				style="width: 50px; cursor: default; font-weight: normal;"
				title="Selected files"
			>{{selectedFilesCounter}}</th>

			<th class="noselect" style="width: 210px;">
				Filename
				<i
					id="sortByNameIcon"
					class="material-icons noselect"
					style="font-size: 20px; cursor: pointer;"
					@click="sort().byName()"
					:style="[!sortModeByName || sortOrderAsc || !sortOrderDesc ? {'transform': 'scale(1, -1)'} : {'transform': 'scale(1, 1)'}]"
				>sort</i>
			</th>
			<th class="noselect">Tags</th>
			<th class="noselect" style="width: 20%;">Description</th>
			<th class="noselect" style="width: 100px;">
				Size (MB)
				<i
					id="sortByNameSize"
					class="material-icons noselect"
					style="transform: scale(1, 1); font-size: 20px; cursor: pointer;"
					@click="sort().bySize()"
					:style="[!sortModeBySize || sortOrderAsc || !sortOrderDesc ? {'transform': 'scale(1, -1)'} : {'transform': 'scale(1, 1)'}]"
				>sort</i>
			</th>
			<th class="noselect" style="width: 150px;">
				Time of adding
				<i
				id="sortByNameTime"
				class="material-icons noselect"
				style="transform: scale(1, 1); font-size: 20px; cursor: pointer;"
				@click="sort().byTime()"
				:style="[!sortModeByTime || sortOrderAsc || !sortOrderDesc ? {'transform': 'scale(1, -1)'} : {'transform': 'scale(1, 1)'}]"
				>sort</i>
			</th>
		</tr>

		<file
			v-for="(file, index) in allFiles"
			:key="index"
			:file="file"
		></file>
	</table>
</div>
</template>
 
<style>
/* 
Use this styles for File components
*/
.file-table__file {
    height: 50px;
}

.file-table__file:hover {
    background-color: #d3d3d3;
}

.file-table__file > td,
th {
    border-bottom: 1px solid #dddddd;
    border-collapse: collapse;
    font-family: arial, sans-serif;
    height: 40px;
    padding: 4px;
    text-align: left;
}

.file-table__checkbox {
}

.file-table__preview {
}

.file-table__filename {
}

.file-table__tags-list {
}

.file-table__description {
}

.file-table__size {
}

.file-table__adding-time {
}
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// Components
import FileComponent from "@components/File/File.vue";
// Classes and types
import { File } from "@app/index/global";
import { TableFile } from "@components/File/types";
// Shared data
import SharedStore from "@app/index/store";
import SharedState from "@app/index/state";
import { State } from "@app/index/state/types";
// Other
import { Const } from "@app/index/const";
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
        file: FileComponent
    }
})
export default class extends Vue {
    offset: number = 0; // current offset
    tableClientHeight: number = 0; // for reactive number of displayed files
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
    selectedFilesIDs: Set<number> = new Set();
    selectedFilesIDsCounter: number = 0; // for reactive selectedFilesIDs
    // Sort modes
    sortModeByName: boolean = true;
    sortModeBySize: boolean = false;
    sortModeByTime: boolean = false;
    //
    sortOrderAsc: boolean = true;
    sortOrderDesc: boolean = false;
    //
    lastSortType: string = Const.sortType.name;

    get allFiles(): File[] {
        // For reactive updating (see @app/index/store/types.ts for more information)
        let reactive = SharedStore.state.allFilesChangesCounter;

        let allFiles = SharedStore.state.allFiles;
        if (!SharedState.state.settings.showDeletedFiles) {
            allFiles = allFiles.filter(f => !f.deleted);
        }

        // Determine should we reset offset
        if (allFiles.length !== this.lastAllFilesLength) {
            // Reset offset
            this.offset = 0;
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
                // Order of files was changed. We have to reset offset.
                this.offset = 0;
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

            this.allFiles.forEach(f => {
                this.selectedFilesIDs.add(f.id);
            });
            this.selectedFilesIDsCounter++;
        } else {
            this.unselectAllFiles();
        }
    }

    unselectAllFiles() {
        this.selectedFilesCounter = 0;
        this.selectedFilesIDs.clear();
        this.selectedFilesIDsCounter++;

        this.allSelected = false;
        SharedState.commit("unsetSelectMode");
    }

    // updateSelectedFiles updates list of selectedFiles
    updateSelectedFiles() {
        let selectedFiles: File[] = [];

        this.allFiles.forEach(f => {
            if (this.selectedFilesIDs.has(f.id)) {
                selectedFiles.push(f);
            }
        });

        SharedStore.commit("setSelectedFiles", selectedFiles);
    }

    // For children
    selectFile(id: number) {
        this.selectedFilesCounter++;
        SharedState.commit("setSelectMode");
        this.selectedFilesIDs.add(id);
        this.selectedFilesIDsCounter++;
        if (this.selectedFilesCounter === this.allFiles.length) {
            this.allSelected = true;
        }
    }

    unselectFile(id: number) {
        this.selectedFilesCounter--;
        this.allSelected = false;
        this.selectedFilesIDs.delete(id);
        this.selectedFilesIDsCounter++;
        if (this.selectedFilesCounter === 0) {
            SharedState.commit("unsetSelectMode");
        }
    }
}
</script>
