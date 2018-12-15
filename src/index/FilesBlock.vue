<template>
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
						selectCount > 0 &&
						selectCount !== allFiles.length"
					@click="toggleAllFiles"
				></th>
			<th>
				<!-- Preview image -->
			</th>
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
			v-for="(file, index) in allFiles"
			:key="index"
			:file="file"
		></files>
	</table>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// Store
import SharedStore from "./store";
import SharedState from "./state";
import { State } from "./state/types";
// Components
import Files from "./components/Files/Files.vue";
//
import { Const } from "./const";
import { Events, EventBus } from "./eventBus";
import { File } from "@/index/global";

@Component({
    components: {
        files: Files
    }
})
export default class extends Vue {
    sortModeByName: boolean = true;
    sortModeBySize: boolean = false;
    sortModeByTime: boolean = false;
    //
    sortOrderAsc: boolean = true;
    sortOrderDesc: boolean = false;
    //
    lastSortType: string = Const.sortType.name;
    //
    allSelected: boolean = false;
    selectCount: number = 0;
    // For updating selected files in SharedStore
    selectedFiles: File[] = [];
    // This counter == this.$childre.length, it reduces on every "sendFile" event
    selectedFilesCounter: number = 0;

    get allFiles() {
        // For reactive updating (see @/index/store/types.ts for more information)
        return SharedStore.state.allFilesChangesCounter && SharedStore.state.allFiles;
    }

    created() {
        EventBus.$on(Events.FilesBlock.UnselectAllFiles, () => {
            this.unselectAllFiles();
        });
        EventBus.$on(Events.UpdateSelectedFiles, () => {
            this.updateSelectedFiles();
        });
        //
        EventBus.$on(Events.FilesBlock.SelectFile, () => {
            this.selectFile();
        });
        EventBus.$on(Events.FilesBlock.UnselectFile, () => {
            this.unselectFile();
        });
        //
        EventBus.$on(Events.FilesBlock.RestoreSortParams, () => {
            this.sort().restoreDefault();
        });

        this.$on("sendFile", (payload: any) => {
            if (payload.selected && payload.file) {
                this.selectedFiles.push(payload.file);
            }
            this.selectedFilesCounter--;
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
            this.selectCount = SharedStore.state.allFiles.length;
            this.allSelected = true;
            SharedState.commit("setSelectMode");

            for (let i in this.$children) {
                this.$children[i].$emit("select");
            }
        } else {
            this.selectCount = 0;
            this.allSelected = false;
            SharedState.commit("unsetSelectMode");

            for (let i in this.$children) {
                this.$children[i].$emit("unselect");
            }
        }
    }

    unselectAllFiles() {
        for (let i in this.$children) {
            this.$children[i].$emit("unselect");
        }
        this.allSelected = false;
        SharedState.commit("unsetSelectMode");
        this.selectCount = 0;
    }

    // updateSelectedFiles updates list of selectedFiles
    // We use this.selectedFilesCounter to count number of $on("sendFile") events
    // After this.selectedFilesCounter == 0, we update SharedStore
    updateSelectedFiles() {
        this.selectedFiles = [];
        this.selectedFilesCounter = this.$children.length;

        for (let i = 0; i < this.$children.length; i++) {
            this.$children[i].$emit("getFile");
        }

        let t = setInterval(() => {
            // Wait for all children call this.parent.$emit("sendFile")
            if (this.selectedFilesCounter === 0) {
                SharedStore.commit("setSelectedFiles", this.selectedFiles);
                clearInterval(t);
            }
        }, 20);
    }

    // For children
    selectFile() {
        this.selectCount++;
        SharedState.commit("setSelectMode");
        if (this.selectCount === Object.keys(SharedStore.state.allFiles).length) {
            this.allSelected = true;
        }
    }

    unselectFile() {
        this.selectCount--;
        this.allSelected = false;
        if (this.selectCount === 0) {
            SharedState.commit("unsetSelectMode");
        }
    }
}
</script>
