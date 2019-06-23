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
					v-model="sortType"
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
					v-model="sortOrder"
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
import FileComponent from "./File.vue";
//Other
import { Const } from "@app/global/const.ts";
import { InternalEvents as ParentEvents } from "@app/index/Files.vue";

// deltaDisplayedFiles defines how many files should be added after scroll to bottom
const deltaDisplayedFiles = 50;

export default Vue.extend({
    components: {
        "card-file": FileComponent
    },
    //
    props: {
        allFiles: {
            type: Array as () => Array<File>,
            required: true
        },
        //
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
            sortTypeOptions: [
                { text: "filename", value: Const.sortType.name },
                { text: "size", value: Const.sortType.size },
                { text: "time", value: Const.sortType.time }
            ],
            sortOrderOptions: [
                { text: "asc", value: Const.sortOrder.asc },
                { text: "desc", value: Const.sortOrder.desc }
            ],
            //
            sortType: Const.sortType.name,
            sortOrder: Const.sortOrder.asc,
            isSortOptionsChanged: false,
            //
            infoBlockHovered: false,
            //
            windowWidth: window.innerWidth,
            maxDisplayedFiles: deltaDisplayedFiles
        };
    },
    computed: {
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
        containerGridTemplateColumns: function() {
            return `repeat(${this.columnsNumber}, 1fr)`;
        }
    },
    //
    created: function() {
        if (this.sortModeByName) {
            this.sortType = Const.sortType.name;
        } else if (this.sortModeBySize) {
            this.sortType = Const.sortType.size;
        } else if (this.sortModeByTime) {
            this.sortType = Const.sortType.time;
        }

        if (this.sortOrderAsc) {
            this.sortOrder = Const.sortOrder.asc;
        } else if (this.sortOrderDesc) {
            this.sortOrder = Const.sortOrder.desc;
        }

        window.addEventListener("resize", () => {
            this.windowWidth = window.innerWidth;
        });

        this.$nextTick(() => {
            let container = <HTMLElement>this.$refs["container"];
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

                let totalHeight = ev.srcElement.scrollTop + ev.srcElement.clientHeight;
                if (totalHeight / ev.srcElement.scrollHeight > 0.9) {
                    this.maxDisplayedFiles += deltaDisplayedFiles;
                }
            });
        });
    },
    watch: {
        // Reset scroll only when order of files is changed
        sortModeByName: function() {
            this.resetScroll();
        },
        sortModeBySize: function() {
            this.resetScroll();
        },
        sortModeByTime: function() {
            this.resetScroll();
        },
        sortOrderAsc: function() {
            this.resetScroll();
        },
        sortOrderDesc: function() {
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
        changeSortOptions: function() {
            let changed = false;

            switch (this.sortType) {
                case Const.sortType.name:
                    if (!this.sortModeByName) changed = true;
                    break;
                case Const.sortType.size:
                    if (!this.sortModeBySize) changed = true;
                    break;
                case Const.sortType.time:
                    if (!this.sortModeByTime) changed = true;
                    break;
            }

            switch (this.sortOrder) {
                case Const.sortOrder.asc:
                    if (!this.sortOrderAsc) changed = true;
                    break;
                case Const.sortOrder.desc:
                    if (!this.sortOrderDesc) changed = true;
                    break;
            }

            this.isSortOptionsChanged = changed;
        },
        applySortOptions: function() {
            this.$parent.$emit(ParentEvents.Sort.Manually, { type: this.sortType, order: this.sortOrder });
            this.isSortOptionsChanged = false;
        },
        resetScroll: function() {
            // Scroll to top
            let container = <HTMLElement>this.$refs["container"];
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
 