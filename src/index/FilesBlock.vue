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

		<files
			v-for="(file, index) in displayedFiles"
			:key="index"
			:file="file"
		></files>
	</table>

	<!-- Progress bar -->
	<div id="progress-bar">
		<i
			v-for="i in 10"
			:key="i"
			class="material-icons noselect"
			:style="[currentProgress === i ? {'opacity': 0.5} : {}]"
			@click="goto(i)"
		>fiber_manual_record</i>
	</div>
</div>
</template>

<style scoped>
#progress-bar {
    display: grid;
    position: fixed;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
}

#progress-bar > i {
    cursor: pointer;
    font-size: 15px;
    opacity: 0.2;
}
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// Components
import Files from "@components/File/File.vue";
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
import { isElementInPath } from "@app/index/tools";
import { Params } from "@app/global";

const trTableHeight = 50;
const maxLastIDs = 10;

let customRound = (n: number, greater: number): number => {
    if ((n * 10) % 10 > greater) {
        return Math.ceil(n);
    } else {
        return Math.floor(n);
    }
};

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

let preloadImages = async (urls: string[]) => {
    let host = Params.Host;
    for (let i = 0; i < urls.length; i++) {
        let img = new Image();
        img.src = host + "/" + urls[i];
    }
};

@Component({
    components: {
        files: Files
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

    get displayedFiles(): TableFile[] {
        let result: TableFile[] = [],
            reactive = this.selectedFilesIDsCounter,
            allFiles = this.allFiles,
            start = this.offset,
            stop = Math.min(this.offset + this.maxDisplayedFiles, allFiles.length);

        for (let i = start; i < stop; i++) {
            let f = new TableFile(allFiles[i]);
            f.selected = this.selectedFilesIDs.has(allFiles[i].id);
            result.push(f);
        }

        let nextImagesURLs: string[] = [];
        start = Math.min(this.offset + this.maxDisplayedFiles, allFiles.length);
        stop = Math.min(start + SharedState.state.settings.scrollOffset, allFiles.length);
        for (let i = start; i < stop; i++) {
            if (allFiles[i].preview !== "") {
                nextImagesURLs.push(allFiles[i].preview);
            }
        }

        preloadImages(nextImagesURLs);

        return result;
    }

    get maxDisplayedFiles(): number {
        let tableClientHeight = this.tableClientHeight;
        if (tableClientHeight === 0) {
            return 10;
        }

        return customRound(tableClientHeight / trTableHeight, 7);
    }

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

    get currentProgress(): number {
        return Math.floor((this.offset / this.allFiles.length) * 10) + 1;
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

        // Event Listener for offset update
        document.addEventListener("wheel", ev => {
            if (!isElementInPath(ev, "files-block-wrapper")) {
                return;
            }

            // Prevent scroll if special keys or right mouse button are pressed
            if (ev.ctrlKey || ev.altKey || ev.shiftKey || ev.buttons === 2) {
                return;
            }

            let deltaOffset: number = SharedState.state.settings.scrollOffset;

            if (ev.deltaY > 0) {
                if (this.offset + deltaOffset < this.allFiles.length) {
                    this.offset += deltaOffset;
                }
            } else if (ev.deltaY < 0) {
                if (this.offset - deltaOffset < 0) {
                    this.offset = 0;
                } else {
                    this.offset -= deltaOffset;
                }
            }
        });

        // Update tableClientHeight after page is loaded and #top-bar is created
        let t = setInterval(() => {
            let elem = document.getElementById("top-bar");
            if (elem === null) {
                return;
            }

            this.tableClientHeight = window.innerHeight - trTableHeight - elem!.clientHeight;
            clearInterval(t);
        }, 10);

        // Update tableClientHeight on window resize
        window.addEventListener("resize", ev => {
            let topBarHeight: number = 0;
            if (document.getElementById("top-bar") !== null) {
                topBarHeight = document.getElementById("top-bar")!.clientHeight;
            }

            // Without header and #top-bar
            this.tableClientHeight = window.innerHeight - trTableHeight - topBarHeight;
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

    // goto updates offset
    // tenPercents - number in [1; 10].
    goto(tenPercents: number) {
        if (tenPercents < 1 || tenPercents > 10) {
            return;
        }

        this.offset = Math.ceil(((tenPercents - 1) * this.allFiles.length) / 10);
    }
}
</script>
