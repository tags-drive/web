<template>
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
						:checked="selectedFilesCounter === allFiles.length"
						:indeterminate.prop="
							selectedFilesCounter > 0 &&
							selectedFilesCounter !== allFiles.length"
						@click.prevent="toggleAllFiles">
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
					:style="[!sortTypeByName || sortOrderAsc || !sortOrderDesc ? {'transform': 'scale(1, -1)'} : {'transform': 'scale(1, 1)'}]"
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
					:style="[!sortTypeBySize || sortOrderAsc || !sortOrderDesc ? {'transform': 'scale(1, -1)'} : {'transform': 'scale(1, 1)'}]"
				>sort</i>
			</div>

			<div class="file-info__adding-time">
				Time of adding
				<i
					id="sortByNameTime"
					class="material-icons noselect"
					style="transform: scale(1, 1); font-size: 20px; cursor: pointer;"
					@click="sort().byTime()"
					:style="[!sortTypeByTime || sortOrderAsc || !sortOrderDesc ? {'transform': 'scale(1, -1)'} : {'transform': 'scale(1, 1)'}]"
				>sort</i>
			</div>
		</div>

		<RecycleScroller
			:items="allFiles"
			:item-size="50"
			id="recycle-scroller"
			ref="recycle-scroller"
		>
			<div slot-scope="{ item }">
				<file :file="item"></file>
			</div>
		</RecycleScroller>
	</div>
</template>


<style lang="scss">
#recycle-scroller {
    // without header
    height: calc(100% - 51px);
}

// Classes for File component

.file-info {
    border-bottom: 1px solid #ddd;
    display: grid;
    grid-template-columns: 40px 60px 210px auto 20% 110px 150px;
    grid-auto-rows: 50px;
    text-align: left;
}

.file-info {
    > div {
        height: 40px;
        line-height: 40px;
        padding: 4px;
    }
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
// Components and classes
import { File } from "@app/global/classes";
import FileComponent from "./File.vue";
// There's no a declaration file for module 'vue-virtual-scroller'.
// So we have to use require() instead of import to escape error
const VirtualScroller = require("vue-virtual-scroller");
const { RecycleScroller } = VirtualScroller;
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
// Other
import {
    InternalEvents as ParentEvents,
    InternalEventBus as ParentEventBus,
    SelectedFilesIDs
} from "@app/index/Files.vue";
import { Const } from "@app/global/const";
import SharedStore from "@app/index/store";
import SharedState from "@app/index/state";

export default Vue.extend({
    components: {
        file: FileComponent,
        RecycleScroller: RecycleScroller
    },
    //
    props: {
        sortType: {
            type: String,
            required: true
        },
        sortOrder: {
            type: String,
            required: true
        }
    },
    data: function() {
        return {
            Store: SharedStore.state,
            selectedFilesIDs: SelectedFilesIDs // for reactivity
        };
    },
    computed: {
        allFiles: function(): File[] {
            // For reactive updating (see @app/index/store/types.ts for more information)
            let reactive = this.Store.allFilesChangesCounter;

            if (!SharedState.state.settings.showDeletedFiles) {
                return this.Store.allFiles.filter(f => {
                    return !f.deleted;
                });
            }

            return this.Store.allFiles;
        },
        //
        sortTypeByName: function(): boolean {
            return this.sortType === Const.sortType.name;
        },
        sortTypeBySize: function(): boolean {
            return this.sortType === Const.sortType.size;
        },
        sortTypeByTime: function(): boolean {
            return this.sortType === Const.sortType.time;
        },
        sortOrderAsc: function(): boolean {
            return this.sortOrder === Const.sortOrder.asc;
        },
        sortOrderDesc: function(): boolean {
            return this.sortOrder === Const.sortOrder.desc;
        },
        //
        selectedFilesCounter: function(): number {
            const reactive = this.selectedFilesIDs.changeCounter;

            return this.selectedFilesIDs.size;
        }
    },
    //
    watch: {
        allFiles: function() {
            // Hack for fixing a bug with tags rendering. When we change tags of a file, the list of tags
            // remains the same because vue-virtual-scroller doesn't rerender items for best performance.
            // We use setTimeout to be sure that items of vue-virtual-scroller were updated.
            setTimeout(() => {
                this.rerender();
            }, 50);
        }
    },
    //
    methods: {
        toggleAllFiles() {
            ParentEventBus.$emit(ParentEvents.ToggleAllFiles);
        },
        sort() {
            return {
                byName: () => {
                    ParentEventBus.$emit(ParentEvents.Sort.ByName);
                },
                bySize: () => {
                    ParentEventBus.$emit(ParentEvents.Sort.BySize);
                },
                byTime: () => {
                    ParentEventBus.$emit(ParentEvents.Sort.ByTime);
                }
            };
        },
        rerender() {
            let recycleScroller = this.$refs["recycle-scroller"] as Vue;
            if (recycleScroller === undefined) {
                return;
            }

            // We can rerender vue-virtual-scroller by changing scrollTop
            const height = recycleScroller.$el.scrollTop;

            recycleScroller.$el.scrollTop = height + 1;
            this.$nextTick(() => {
                recycleScroller.$el.scrollTop = height;
            });
        }
    }
});
</script>
