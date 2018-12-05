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
						selectCount != Store.allFiles.length"
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
					:style="[sortByNameModeAsc ? {'transform': 'scale(1, 1)'} : {'transform': 'scale(1, -1)'}]"
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
					:style="[sortBySizeModeAsc ? {'transform': 'scale(1, 1)'} : {'transform': 'scale(1, -1)'}]"
				>sort</i>
			</th>
			<th class="noselect" style="width: 150px;">
				Time of adding
				<i
				id="sortByNameTime"
				class="material-icons noselect"
				style="transform: scale(1, 1); font-size: 20px; cursor: pointer;"
				@click="sort().byTime()"
				:style="[sortByTimeModeAsc ? {'transform': 'scale(1, 1)'} : {'transform': 'scale(1, -1)'}]"
				>sort</i>
			</th>
		</tr>

		<files
			v-for="(file, index) in Store.allFiles"
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
import { Store } from "./store/types";
import SharedState from "./state";
import { State } from "./state/types";
// Components
import Files from "./components/Files.vue";
//
import { Const } from "./tools";
import { Events, EventBus } from "./eventBus";

@Component({
    components: {
        files: Files
    }
})
export default class extends Vue {
    sortByNameModeAsc: boolean = true;
    sortBySizeModeAsc: boolean = true;
    sortByTimeModeAsc: boolean = true;
    lastSortType: string = Const.sortType.name; // TODO
    //
    allSelected: boolean = false;
    selectCount: number = 0;
    //
    Store: Store = SharedStore.state;

    mounted() {
        EventBus.$on(Events.UnselectAllFiles, () => {
            this.unselectAllFiles();
        });
        EventBus.$on(Events.UpdateSelectedFiles, () => {
            this.updateSelectedFiles();
        });
        EventBus.$on(Events.ResetSortParams, () => {
            this.sort().reset();
        });
    }

    // Sorts
    sort() {
        return {
            byName: () => {
                if (this.lastSortType == Const.sortType.name) {
                    this.sortByNameModeAsc = !this.sortByNameModeAsc;
                } else {
                    // Use default settings
                    this.sort().reset();
                }
                this.lastSortType = Const.sortType.name;

                let type = Const.sortType.name,
                    order = this.sortByNameModeAsc ? Const.sortOrder.asc : Const.sortOrder.desc;

                EventBus.$emit(Events.AdvancedSearch, { type: type, order: order });
            },
            bySize: () => {
                if (this.lastSortType == Const.sortType.size) {
                    this.sortBySizeModeAsc = !this.sortBySizeModeAsc;
                } else {
                    // Use default settings
                    this.sort().reset();
                }
                this.lastSortType = Const.sortType.size;

                let type = Const.sortType.size,
                    order = this.sortBySizeModeAsc ? Const.sortOrder.asc : Const.sortOrder.desc;

                EventBus.$emit(Events.AdvancedSearch, { type: type, order: order });
            },
            byTime: () => {
                if (this.lastSortType == Const.sortType.time) {
                    this.sortByTimeModeAsc = !this.sortByTimeModeAsc;
                } else {
                    // Use default settings
                    this.sort().reset();
                }
                this.lastSortType = Const.sortType.time;

                let type = Const.sortType.time,
                    order = this.sortByTimeModeAsc ? Const.sortOrder.asc : Const.sortOrder.desc;

                EventBus.$emit(Events.AdvancedSearch, { type: type, order: order });
            },
            reset: () => {
                this.sortByNameModeAsc = true;
                this.sortBySizeModeAsc = true;
                this.sortByTimeModeAsc = true;
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

    // updateSelectedFiles updates list of selectedFiles in SharedStore
    updateSelectedFiles() {
        // let files = [];
        for (let i in this.$children) {
            // if (this.$children[i].selected) {
            //     if (this.$children[i].file != undefined) {
            //         files.push(this.$children[i].file);
            //     }
            // }
        }
        // SharedStore.commit("setSelectedFiles", files);
    }

    // For children
    selectFile() {
        this.selectCount++;
        SharedState.commit("setSelectMode");
        if (this.selectCount == Object.keys(SharedStore.state.allFiles).length) {
            this.allSelected = true;
        }
    }

    unselectFile() {
        this.selectCount--;
        this.allSelected = false;
        if (this.selectCount == 0) {
            SharedState.commit("unsetSelectMode");
        }
    }
}
</script>
