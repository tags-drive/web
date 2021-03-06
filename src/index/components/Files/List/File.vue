<template>
	<div
		class="file-info hover-class"
		:style="stylesObject"
		:title="titleMessage"
		@click.right.prevent.exact="showContextMenu($event, file);"
		@click.ctrl="toggleSelect()"
	>
		<!-- There are some nonexistent classes. They are reserved for readability and future using -->
		<div class="file-info__checkbox">
			<div>
				<input
					type="checkbox"
					style="height: 15px; width: 15px;"
					:checked="fileSelected"
					@change="toggleSelect">
			</div>
		</div>

		<div
			class="file-info__preview"
			title="Show preview"
			style="cursor: pointer;"
			@click="showPreview"
		>
			<div class="image-wrapper">
				<loader :src="previewLink"></loader>
			</div>
		</div>

		<div class="file-info__filename">
			<div class="filename" :title="file.filename">
				{{file.filename}}
			</div>
		</div>

		<div
			class="file-info__tags-list"
			ref="tags-list-wrapper"
		>
			<div
				class="tags-list"
				ref="tags-list"
				@mouseover="tagsListHover = true;"
				@mouseleave="tagsListHover = false;"
				:style="tagsStyle"
			>
				<tag
					v-for="(id, index) in file.tags"
					style="margin-top: 3px; margin-bottom: 3px;"
					:key="index"
					:tag="Store.allTags.get(id)"
				></tag>
			</div>
		</div>

		<div class="file-info__description">
			<div class="description" :title="file.description">
				{{file.description}}
			</div>
		</div>

		<div class="file-info__size">{{ fileSize }}</div>

		<div class="file-info__adding-time">{{ fileAddTime }}</div>
	</div>
</template>


<style lang="scss" scoped>
.hover-class:hover {
    background-color: #dcdcdc30;
}

.filename,
.description {
    -o-text-overflow: ellipsis;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.image-wrapper {
    height: inherit;
    text-align: center;

    img {
        display: inline-block;
        height: auto;
        max-height: 100%;
        max-width: 100%;
        vertical-align: middle;
        width: auto;
    }
}

.tags-list {
    // If there are too many tags, we change color of left border.
    // Without border-left in style there are some layout bugs.
    border-left: 1px solid #00000000;
    display: flex;
    flex-wrap: wrap;
    height: inherit;
    overflow-y: hidden;
    padding-left: 3px;
    position: relative;
}
</style>


<script lang="ts">
import Vue from "vue";
// Components
import TagComponent from "@components/Tag/Tag.vue";
import LoaderComponent from "@app/global/components/Loader/Loader.vue";
// Classes and types
import { Tag, File } from "@app/global/classes";
import {
    InternalEvents as ParentEvents,
    InternalEventBus as ParentEventBus,
    SelectedFilesIDs
} from "@app/index/Files.vue";
// Shared data
import SharedStore from "@app/index/store";
import SharedState from "@app/index/state";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import { Params } from "@app/global";
import { Const, DateformatMask } from "@app/global/const";
import { ConvertBytesToString } from "@app/global/utils";
import dateformat from "dateformat";

const tagsListPadding = 4;

export default Vue.extend({
    props: {
        file: File
    },
    data: function() {
        return {
            overflow: false,
            tagsListHover: false,
            // rightClicked is true when user clicked right button to show context menu
            // It is became false after hiding Context Menu (when Events.ContextMenu.Hide emitted)
            rightClicked: false,
            // setInterval id
            overflowChecker: 0,
            //
            Store: SharedStore.state,
            State: SharedState.state,
            selectedFilesIDs: SelectedFilesIDs // for reactivity
        };
    },
    computed: {
        fileSelected: function(): boolean {
            const reactive = this.selectedFilesIDs.changeCounter;

            return this.selectedFilesIDs.check(this.file.id);
        },
        stylesObject: function(): any {
            let style = {
                opacity: this.file.deleted && !this.fileSelected ? 0.4 : 1
            } as any;

            if (this.fileSelected || this.rightClicked) {
                style["background-color"] = "#dcdcdc50";
            }

            return style;
        },
        titleMessage: function(): string {
            if (!this.file.deleted) {
                return "";
            }
            let date = new Date(this.file.timeToDelete),
                now = new Date();

            let leftHours = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60)), // in hours
                leftDays = 0;

            if (leftHours < 1) {
                // File should be already deleted or it's left less than 1 hour
                return "File is in a Trash. It will be deleted soon";
            }

            if (leftHours > 24) {
                leftDays = Math.round(leftHours / 24);
                leftHours = leftHours % 24;
            }

            return `File is in a Trash. It will be deleted in ${leftDays} days ${leftHours} hours`;
        },
        previewLink: function(): string {
            if (this.file.type.previewType === Const.previewTypes.image) {
                let params = "";
                if (SharedState.state.shareMode) {
                    params = "?shareToken=" + SharedState.state.shareToken;
                }

                return Params.Host + "/" + this.file.preview + params;
            }

            let ext = this.file.filename.split(".").pop(),
                filename = this.file.filename;

            return Params.Host + `/file-icons?ext=${ext}&filename=${filename}`;
        },
        tagsStyle: function(): any {
            if (!this.tagsListHover && this.overflow) {
                return { "border-left-color": "black" };
            }

            let list = this.$refs["tags-list"] as HTMLElement;
            if (list === undefined || list.clientHeight >= list.scrollHeight) {
                return;
            }

            let wrapper = this.$refs["tags-list-wrapper"] as HTMLElement;
            if (wrapper === undefined) {
                return;
            }

            // Magic //

            // There is a bug with RecycleScroller when next files cover expanded tags-list.
            // So we have to change their z-index to n-1 and current to n (n = 1).

            // Get current RecycleScroller node
            let currNode = list.parentElement!.parentElement!.parentElement!.parentElement!;
            currNode.style.zIndex = "1";

            let RecycleScroller = currNode.parentElement!;
            let shouldChange = false;
            for (let i = 0; i < RecycleScroller.childNodes.length; i++) {
                if (RecycleScroller.childNodes[i] === currNode) {
                    shouldChange = true;
                    continue;
                }

                if (shouldChange) {
                    let nextNode = RecycleScroller.childNodes[i] as HTMLElement;
                    if (nextNode !== undefined) {
                        nextNode.style.zIndex = "0";
                    }
                }
            }
            // End of Magic //

            let rect = wrapper.getBoundingClientRect();

            return {
                "background-color": "white",
                border: "1px solid #00000080",
                "border-radius": "5px",
                height: "auto",
                left: rect.left - 1 + "px", // minus border width
                padding: tagsListPadding + "px",
                position: "fixed",
                width: rect.width - tagsListPadding * 2 + "px"
            };
        },
        fileSize: function(): string {
            return ConvertBytesToString(this.file.size);
        },
        fileAddTime(): string {
            return dateformat(this.file.addTime, DateformatMask);
        }
    },
    //
    components: {
        tag: TagComponent,
        loader: LoaderComponent
    },
    //
    created: function() {
        this.overflowChecker = window.setInterval(() => {
            let list = this.$refs["tags-list"] as HTMLElement;
            if (list === undefined) {
                this.overflow = false;
                return;
            }

            this.overflow = list.scrollHeight > list.clientHeight;
        }, 10);
    },
    destroyed: function() {
        clearInterval(this.overflowChecker);
    },
    //
    methods: {
        showContextMenu(event: MouseEvent) {
            // Don't show Context Menu when file isn't selected
            if (this.State.selectMode && !this.fileSelected) {
                return;
            }

            // Reset other files at first
            EventBus.$emit(Events.FilesBlock.UnfocusFile);

            this.rightClicked = true;

            // Show Context Menu
            EventBus.$emit(Events.ShowContextMenu, { file: this.file, x: event.x, y: event.y });

            // handler sets rightClicked to false and unregisters itself from EventBus
            let handler = () => {
                this.rightClicked = false;
                EventBus.$off(Events.FilesBlock.UnfocusFile, handler);
            };

            EventBus.$on(Events.FilesBlock.UnfocusFile, handler);
        },
        showPreview() {
            EventBus.$emit(Events.ShowPreview, { file: this.file });
        },
        toggleSelect() {
            if (!this.fileSelected) {
                ParentEventBus.$emit(ParentEvents.SelectFile, { id: this.file.id });
            } else {
                ParentEventBus.$emit(ParentEvents.UnselectFile, { id: this.file.id });
            }
        }
    }
});
</script>
