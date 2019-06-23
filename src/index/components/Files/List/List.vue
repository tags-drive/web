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
						:checked="allSelected"
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
import { InternalEvents as ParentEvents } from "@app/index/Files.vue";
import { Const } from "@app/global/const";
import SharedStore from "@app/index/store";

export default Vue.extend({
    components: {
        file: FileComponent,
        RecycleScroller: RecycleScroller
    },
    //
    props: {
        allFiles: {
            type: Array as () => Array<File>,
            required: true
        },
        //
        allSelected: {
            type: Boolean,
            required: true
        },
        selectedFilesCounter: {
            type: Number,
            required: true
        },
        //
        sortModeByName: {
            type: Boolean,
            required: true
        },
        sortModeBySize: {
            type: Boolean,
            required: true
        },
        sortModeByTime: {
            type: Boolean,
            required: true
        },
        //
        sortOrderAsc: {
            type: Boolean,
            required: true
        },
        sortOrderDesc: {
            type: Boolean,
            required: true
        }
    },
    data: function() {
        return {
            Store: SharedStore.state
        };
    },
    //
    methods: {
        toggleAllFiles: function() {
            this.$parent.$emit(ParentEvents.ToggleAllFiles);
        },

        sort: function() {
            return {
                byName: () => {
                    this.$parent.$emit(ParentEvents.Sort.ByName);
                },
                bySize: () => {
                    this.$parent.$emit(ParentEvents.Sort.BySize);
                },
                byTime: () => {
                    this.$parent.$emit(ParentEvents.Sort.ByTime);
                }
            };
        }
    }
});
</script>