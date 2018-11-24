<template>
	<table
		id="file-table"
		style="border-collapse: collapse; width: 100%;"
		:style="{'opacity': SharedState.state.filesBlockOpacity}"
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
						selectCount != Object.keys(SharedStore.state.allFiles).length"
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
			v-for="(file, index) in SharedStore.state.allFiles"
			:key="index"
			:file="file"
			:allTags="SharedStore.state.allTags"
		></files>
	</table>
</template>

<script>
// Components
import Files from "./components/Files.vue";
//
import { Events, EventBus } from "./eventBus";

export default {
    data: function() {
        return {
            sortByNameModeAsc: true,
            sortBySizeModeAsc: true,
            sortByTimeModeAsc: true,
            lastSortType: this.Const.sortType.name,

            allSelected: false,
            selectCount: 0
        };
    },
    components: {
        files: Files
    },
    mounted: function() {
        EventBus.$on(Events.UnselectAllFiles, () => {
            this.unselectAllFiles();
        });
        EventBus.$on(Events.UpdateSelectedFiles, () => {
            this.updateSelectedFiles();
        });
        EventBus.$on(Events.ResetSortParams, () => {
            this.sort().reset();
        });
    },
    methods: {
        // Sorts
        sort: function() {
            return {
                byName: () => {
                    if (this.lastSortType == this.Const.sortType.name) {
                        this.sortByNameModeAsc = !this.sortByNameModeAsc;
                    } else {
                        // Use default settings
                        this.sort().reset();
                    }
                    this.lastSortType = this.Const.sortType.name;

                    let type = this.Const.sortType.name,
                        order = this.sortByNameModeAsc ? this.Const.sortOrder.asc : this.Const.sortOrder.desc;

                    EventBus.$emit(Events.AdvancedSearch, { type: type, order: order });
                },
                bySize: () => {
                    if (this.lastSortType == this.Const.sortType.size) {
                        this.sortBySizeModeAsc = !this.sortBySizeModeAsc;
                    } else {
                        // Use default settings
                        this.sort().reset();
                    }
                    this.lastSortType = this.Const.sortType.size;

                    let type = this.Const.sortType.size,
                        order = this.sortBySizeModeAsc ? this.Const.sortOrder.asc : this.Const.sortOrder.desc;

                    EventBus.$emit(Events.AdvancedSearch, { type: type, order: order });
                },
                byTime: () => {
                    if (this.lastSortType == this.Const.sortType.time) {
                        this.sortByTimeModeAsc = !this.sortByTimeModeAsc;
                    } else {
                        // Use default settings
                        this.sort().reset();
                    }
                    this.lastSortType = this.Const.sortType.time;

                    let type = this.Const.sortType.time,
                        order = this.sortByTimeModeAsc ? this.Const.sortOrder.asc : this.Const.sortOrder.desc;

                    EventBus.$emit(Events.AdvancedSearch, { type: type, order: order });
                },
                reset: () => {
                    this.sortByNameModeAsc = true;
                    this.sortBySizeModeAsc = true;
                    this.sortByTimeModeAsc = true;
                }
            };
        },
        // Select mode
        toggleAllFiles: function() {
            if (!this.allSelected) {
                this.selectCount = this.SharedStore.state.allFiles.length;
                this.allSelected = true;
                this.SharedState.commit("setSelectMode");

                for (let i in this.$children) {
                    this.$children[i].select();
                }
            } else {
                this.selectCount = 0;
                this.allSelected = false;
                this.SharedState.commit("unsetSelectMode");

                for (let i in this.$children) {
                    this.$children[i].unselect();
                }
            }
        },
        unselectAllFiles: function() {
            for (let i in this.$children) {
                this.$children[i].unselect();
            }
            this.allSelected = false;
            this.SharedState.commit("unsetSelectMode");
            this.selectCount = 0;
        },
        // updateSelectedFiles updates list of selectedFiles in SharedStore
        updateSelectedFiles: function() {
            let files = [];
            for (let i in this.$children) {
                if (this.$children[i].selected) {
                    if (this.$children[i].file != undefined) {
                        files.push(this.$children[i].file);
                    }
                }
            }
            this.SharedStore.commit("setSelectedFiles", files);
        },
        // For children
        selectFile: function() {
            this.selectCount++;
            this.SharedState.commit("setSelectMode");
            if (this.selectCount == Object.keys(this.SharedStore.state.allFiles).length) {
                this.allSelected = true;
            }
        },
        unselectFile: function() {
            this.selectCount--;
            this.allSelected = false;
            if (this.selectCount == 0) {
                this.SharedState.commit("unsetSelectMode");
            }
        }
    }
};
</script>
