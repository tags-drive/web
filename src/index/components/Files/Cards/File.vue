<template>
	<div
		id="card"
		:style="cardStyles"
		@click.right.prevent.exact="showContextMenu($event);"
		@click.ctrl.prevent="toggleSelect"
	>
		<!-- Preview -->
		<div id="preview" title="Show preview">
			<div
				class="image-wrapper noselect"
				@click.left.exact="showPreview"
			>
				<span class="helper"></span>
				<loader
					:style="previewImageStyle"
					:src="previewLink"
				></loader>
			</div>
		</div>

		<!-- Filename -->
		<div id="filename">
			<span class="noselect">{{file.filename}}</span>
		</div>

		<!-- Tags -->
		<div id="tags-list">
			<tag
				v-for="(id, i) in file.tags"
				:key="i"
				:tag="Store.allTags.get(id)"
				class="tag"
			></tag>
		</div>
	</div>
</template>


<style lang="scss" scoped>
#card {
    border-radius: 5px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19);
    box-sizing: border-box;
    margin: 20px 0;
    width: 100%;

    &:first-child {
        margin-top: 10px;
    }

    &:hover {
        background-color: #dcdcdc30;
    }

    > #preview {
        margin-bottom: 10px;

        > .image-wrapper {
            cursor: pointer;
            margin: auto;
            text-align: center;

            /* Help to center an image vertically */
            > span.helper {
                display: inline-block;
                height: 100%;
                vertical-align: middle;
            }

            > img {
                border-radius: 3px;
                display: inline-block;
                height: auto;
                vertical-align: middle;
                width: 100%;
            }
        }
    }

    > #filename {
        margin: 0 auto 10px;
        text-align: center;
        width: 95%;
        word-break: break-all;
    }

    > #tags-list {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        margin: auto;
        width: 95%;

        > .tag {
            margin-bottom: 5px;
        }
    }
}
</style>


<script lang="ts">
import Vue from "vue";
// Components and classes
import TagComponent from "@components/Tag/Tag.vue";
import LoaderComponent from "@app/global/components/Loader/Loader.vue";
import { File } from "@app/global/classes";
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
import { Const } from "@app/global/const";

export default Vue.extend({
    components: {
        loader: LoaderComponent,
        tag: TagComponent
    },
    //
    props: {
        file: {
            type: File,
            required: true
        }
    },
    data: function() {
        return {
            rightClicked: false,
            //
            State: SharedState.state,
            Store: SharedStore.state,
            selectedFilesIDs: SelectedFilesIDs // for reactivity
        };
    },
    computed: {
        fileSelected: function(): boolean {
            const reactive = this.selectedFilesIDs.changeCounter;

            return this.selectedFilesIDs.check(this.file.id);
        },
        cardStyles: function(): any {
            if (this.fileSelected || this.rightClicked) {
                return {
                    "background-color": "#dcdcdc50"
                };
            }

            return {};
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
        previewImageStyle: function(): any {
            if (this.file.type.previewType === Const.previewTypes.image) {
                // Can display an image preview
                return {
                    "background-color": "#ffffff"
                };
            }

            // Have to display an extension icon
            return {
                "max-width": "50px",
                "max-height": "50px",
                "margin-top": "5px"
            };
        }
    },
    //
    methods: {
        showContextMenu(event: MouseEvent) {
            // Don't show Context Menu when file isn't selected
            if (this.State.selectMode && !this.fileSelected) {
                return;
            }

            // Unfocus another file at first
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
            if (this.fileSelected) {
                ParentEventBus.$emit(ParentEvents.UnselectFile, { id: this.file.id });
            } else {
                ParentEventBus.$emit(ParentEvents.SelectFile, { id: this.file.id });
            }
        }
    }
});
</script>
