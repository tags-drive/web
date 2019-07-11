<template>
<div id="cards-block">
	<div
		id="sticky-wrapper"
		class="noselect"
	>
		<div
			id="info"
			:style="isSortOptionsChanged || infoBlockHovered ? {'opacity': '0.95'} : {'opacity': '0.3'}"
			@mouseenter="infoBlockHovered = true"
			@mouseleave="infoBlockHovered = false"
		>
			<div title="Number of selected files">
				<span>{{selectedFilesCounter}}/{{allFiles.length}}</span>
			</div>

			<div id="sort-options">
				<span>Sort by</span>

				<select
					id="sort-type-selector"
					v-model="newSortType"
					@change="changeSortOptions"
				>
					<option
						v-for="(opt, i) in sortTypeOptions"
						:key="i"
						:value="opt.value"
					>{{opt.text}}</option>
				</select>

				<select
					id="sort-order-selector"
					v-model="newSortOrder"
					@change="changeSortOptions"
				>
					<option
						v-for="(opt, i) in sortOrderOptions"
						:key="i"
						:value="opt.value"
					>{{opt.text}}</option>
				</select>

				<i
					v-if="isSortOptionsChanged"
					class="material-icons noselect"
					title="Apply"
					@click="applySortOptions"
				>done</i>
			</div>
		</div>
	</div>

	<div
		id="container"
		ref="container"
		:style="{ 'grid-template-columns': containerGridTemplateColumns }"
		@click.right.self.prevent
	>
		<div
			v-for="i in columnsNumber"
			:key="i"
		>
			<!-- i starts from 1 -->
			<div
				v-for="(file, j) in filesInColumn(i-1)"
				:key="j"
			>
				<card-file :file="file"></card-file>
			</div>
		</div>
	</div>
</div>
</template>


<style lang="scss" scoped>
#cards-block {
    height: 100%;
    overflow-y: auto;

    > #sticky-wrapper {
        position: sticky;
        right: 0;
        top: 0;
        z-index: 1;

        > #info {
            $height: 25px;

            background-color: white;
            border: 1px solid #88888850;
            border-radius: 5px;
            display: grid;
            grid-template-columns: 20% 80%;
            font-size: 14px;
            height: $height;
            line-height: $height;
            padding: 3px;
            position: absolute;
            right: 5px;
            text-align: center;
            transition: opacity 0.2s;
            top: 5px;
            width: 280px;

            > #sort-options {
                > * {
                    margin-right: 5px;

                    &:last-child {
                        margin-right: 0;
                    }
                }

                > i {
                    cursor: pointer;
                }

                select {
                    border: 1px solid #888888;
                    border-radius: 3px;
                    height: 20px;
                    margin-top: auto;
                    margin-bottom: auto;
                    outline: none;
                }
            }
        }
    }

    > #container {
        $gap: 25px;

        display: grid;
        grid-gap: 20px;
        margin: 0 auto;
        position: relative;
        width: calc(100% - #{$gap});
    }
}
</style>


<script lang="ts">
import Vue from "vue";
// Components and classes
import { File } from "@app/global/classes";
import FileComponent from "./File.vue";
//Other
import { Const } from "@app/global/const.ts";
import {
    InternalEvents as ParentEvents,
    InternalEventBus as ParentEventBus,
    SelectedFilesIDs
} from "@app/index/Files.vue";
import SharedStore from "@app/index/store";
import SharedState from "@app/index/state";

// deltaDisplayedFiles defines how many files should be added after scroll to bottom
const deltaDisplayedFiles = 50;

export default Vue.extend({
    components: {
        "card-file": FileComponent
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
            sortTypeOptions: [
                { text: "filename", value: Const.sortType.name },
                { text: "size", value: Const.sortType.size },
                { text: "time", value: Const.sortType.time }
            ],
            sortOrderOptions: [
                { text: "asc", value: Const.sortOrder.asc },
                { text: "desc", value: Const.sortOrder.desc }
            ],
            newSortType: "",
            newSortOrder: "",
            //
            isSortOptionsChanged: false,
            //
            infoBlockHovered: false,
            //
            windowWidth: window.innerWidth,
            maxDisplayedFiles: deltaDisplayedFiles,
            //
            Store: SharedStore.state,
            selectedFilesIDs: SelectedFilesIDs // for reactivitiy
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
        selectedFilesCounter: function(): number {
            const reactive = this.selectedFilesIDs.changeCounter;

            return this.selectedFilesIDs.size;
        },
        columnsNumber: function(): number {
            let width = this.windowWidth;

            if (1900 <= width) {
                return 6;
            }
            if (1250 <= width && width < 1900) {
                return 5;
            }
            if (1000 <= width && width < 1250) {
                return 4;
            }

            return 3;
        },
        containerGridTemplateColumns: function(): string {
            return `repeat(${this.columnsNumber}, 1fr)`;
        }
    },
    //
    created: function() {
        this.newSortType = this.sortType;
        this.newSortOrder = this.sortOrder;

        window.addEventListener("resize", () => {
            this.windowWidth = window.innerWidth;
        });

        this.$nextTick(() => {
            let container = this.$refs["container"] as HTMLElement;
            if (container === undefined) {
                return;
            }

            let wrapper = container.parentElement;
            if (wrapper === null) {
                return;
            }

            wrapper.addEventListener("scroll", ev => {
                if (ev.srcElement === null || ev.srcElement === null) {
                    return;
                }

                if (this.maxDisplayedFiles > this.allFiles.length) {
                    return;
                }

                const elem = ev.srcElement as Element;
                let totalHeight = elem.scrollTop + elem.clientHeight;
                if (totalHeight / elem.scrollHeight > 0.9) {
                    this.maxDisplayedFiles += deltaDisplayedFiles;
                }
            });
        });
    },
    watch: {
        // Reset scroll only when order of files is changed
        sortType: function(newValue) {
            this.newSortType = newValue as string;
            this.isSortOptionsChanged = false;
            this.resetScroll();
        },
        sortOrder: function(newValue) {
            this.newSortOrder = newValue as string;
            this.isSortOptionsChanged = false;
            this.resetScroll();
        }
    },
    //
    methods: {
        filesInColumn(columnIndex: number) {
            let res: File[] = [];

            for (let i = columnIndex; i < this.allFiles.length && i < this.maxDisplayedFiles; i += this.columnsNumber) {
                res.push(this.allFiles[i]);
            }

            return res;
        },
        changeSortOptions() {
            let changed = false;
            if (this.newSortType !== this.sortType || this.newSortOrder !== this.sortOrder) {
                changed = true;
            }

            this.isSortOptionsChanged = changed;
        },
        applySortOptions() {
            ParentEventBus.$emit(ParentEvents.Sort.Manually, { type: this.newSortType, order: this.newSortOrder });
            this.isSortOptionsChanged = false;
        },
        resetScroll() {
            // Scroll to top
            let container = this.$refs["container"] as HTMLElement;
            if (container === undefined) {
                return;
            }

            let wrapper = container.parentElement;
            if (wrapper === null) {
                return;
            }

            wrapper.scrollTop = 0;

            // Reset maxDisplayedFiles
            this.maxDisplayedFiles = deltaDisplayedFiles;
        }
    }
});
</script>
 