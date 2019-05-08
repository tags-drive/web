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
				<loader :src="previewLink"></loader>
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
    border: 1px solid #88888860;
    border-radius: 5px;
    box-sizing: border-box;
    margin: 20px 0;
    padding: 5px;
    padding-bottom: 0px; // tags in #tags-list have "margin-bottom: 5px"
    width: 100%;

    &:first-child {
        margin-top: 10px;
    }

    &:hover {
        background-color: #dcdcdc50;
    }

    > #preview {
        margin-bottom: 10px;

        > .image-wrapper {
            cursor: pointer;
            max-width: 80%;
            margin: auto;
            text-align: center;
            width: 80%;

            /* Help to center an image vertically */
            > span.helper {
                display: inline-block;
                height: 100%;
                vertical-align: middle;
            }

            > img {
                background-color: #ffffff;
                border-radius: 3px;
                display: inline-block;
                height: auto;
                max-height: 300px;
                max-width: 100%;
                vertical-align: middle;
                width: auto;
            }
        }
    }

    > #filename {
        margin-bottom: 10px;
        text-align: center;
        word-break: break-all;
    }

    > #tags-list {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;

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
import { TableFile } from "@app/index/Files.vue";
// Shared data
import SharedStore from "@app/index/store";
import { Store } from "@app/index/store/types";
import SharedState from "@app/index/state";
import { State } from "@app/index/state/types";
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
            type: TableFile,
            required: true
        }
    },
    data: function() {
        return {
            selected: false,
            rightClicked: false,
            //
            State: SharedState.state,
            Store: SharedStore.state
        };
    },
    computed: {
        cardStyles: function() {
            if (this.selected || this.rightClicked) {
                return {
                    "background-color": "#dcdcdcc0"
                };
            }

            return {};
        },
        previewLink: function(): string {
            if (this.file.type.previewType === Const.previewTypes.image) {
                return Params.Host + "/" + this.file.preview;
            }

            return Params.Host + "/ext/" + this.file.filename.split(".").pop();
        }
    },
    //
    created: function() {
        this.selected = this.file.selected;
    },
    updated: function() {
        this.selected = this.file.selected;
    },
    //
    methods: {
        showContextMenu(event: MouseEvent) {
            // Don't show Context Menu when file isn't selected
            if (this.State.selectMode && !this.file.selected) {
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
            this.selected = !this.selected;

            if (this.selected) {
                EventBus.$emit(Events.FilesBlock.SelectFile, { id: this.file.id });
            } else {
                EventBus.$emit(Events.FilesBlock.UnselectFile, { id: this.file.id });
            }
        }
    }
});
</script>
