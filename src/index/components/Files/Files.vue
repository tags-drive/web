<template>
	<tr
		v-show="!file.deleted || State.settings.showDeletedFiles"
		class="file-info"
		:style="stylesObject"
		:title="titleMessage"
		@mouseover="hover = true;"
		@mouseleave="hover = false;"
		@click.right.prevent="showContextMenu($event, file);"
	>
		<td style="text-align: center;">
			<input
				type="checkbox"
				style="height: 15px; width: 15px;"
				v-model="file.selected"
				@change="toggleSelect">
		</td>
		<td
			title="Show preview"
			style="cursor: pointer;"
			@click="showPreview"
		>
			<div class="image-wrapper">
				<img :src="previewLink">
			</div>
		</td>
		<td>
			<div class="filename" :title="file.filename">
				{{file.filename}}
			</div>
		</td>
		<td
			ref="tags-list-wrapper"
		>
			<div
				style="display: flex; flex-wrap: wrap; height: inherit; overflow-y: hidden;"
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
		</td>
		<td :title="file.description">
			{{
				// Cut too long description
				(file.description.length > 20) ? file.description.slice(0, 20) + '...' : file.description
			}}
		</td>
		<td>{{(file.size / (1024 * 1024)).toFixed(1)}}</td>
		<td>{{file.addTime}}</td>
	</tr>
</template>

<style scoped>
.filename {
    -o-text-overflow: ellipsis;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 200px;
}

.image-wrapper {
    height: inherit;
    text-align: center;
}

.image-wrapper > img {
    display: inline-block;
    height: auto;
    max-height: 100%;
    max-width: 100%;
    width: auto;
}
</style>


<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
// Components
import TagComponent from "@components/Tag/Tag.vue";
// Classes and types
import { Tag } from "@app/index/global";
import { TableFile } from "@app/index/components/Files/types";
// Shared data
import SharedStore from "@app/index/store";
import { Store } from "@app/index/store/types";
import SharedState from "@app/index/state";
import { State } from "@app/index/state/types";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import { Params } from "@app/global";

const tagsListPadding = 4;

@Component({
    components: {
        tag: TagComponent
    }
})
export default class extends Vue {
    @Prop() file!: TableFile;
    hover: boolean = false;
    tagsListHover: boolean = false;
    //
    Store: Store = SharedStore.state;
    State: State = SharedState.state;

    get stylesObject() {
        let bgColor = "white";
        if (this.hover || this.file.selected) {
            bgColor = "rgba(0, 0, 0, 0.1)";
        }
        return {
            opacity: this.file.deleted && !this.file.selected ? 0.4 : 1,
            "background-color": bgColor
        };
    }

    get titleMessage(): string {
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
    }

    get previewLink(): string {
        if (this.file.type === "image") {
            return Params.Host + "/" + this.file.preview;
        }

        return Params.Host + "/ext/" + this.file.filename.split(".").pop();
    }

    get tagsStyle() {
        if (!this.tagsListHover) {
            return;
        }

        let list = <HTMLElement>this.$refs["tags-list"];
        if (list === undefined || list.clientHeight >= list.scrollHeight) {
            return;
        }

        let wrapper = <HTMLElement>this.$refs["tags-list-wrapper"];
        if (wrapper === undefined) {
            return;
        }

        let rect = wrapper.getBoundingClientRect();

        return {
            "background-color": "white",
            border: "1px solid #00000080",
            "border-radius": "5px",
            height: "auto",
            left: rect.left - 1 + "px", // minus border width
            padding: tagsListPadding + "px",
            position: "fixed",
            top: rect.top + "px",
            width: rect.width - tagsListPadding * 2 + "px"
        };
    }

    created() {
        let func = () => {
            let list = <HTMLElement>this.$refs["tags-list"];
            if (list === undefined) {
                return;
            }

            if (list.scrollTop + list.clientHeight >= list.scrollHeight) {
                list.scrollTop = 0;
                // Show top
                setTimeout(func, 1500);
                return;
            }

            list.scrollTop++;
            if (list.scrollTop + list.clientHeight >= list.scrollHeight) {
                // Show bottom
                setTimeout(func, 1000);
                return;
            }

            setTimeout(func, 30);
        };

        setTimeout(func, 1500);
    }

    showContextMenu(event: MouseEvent) {
        EventBus.$emit(Events.ShowContextMenu, { file: this.file, x: event.x, y: event.y });
    }

    showPreview() {
        EventBus.$emit(Events.ShowPreview, { file: this.file });
    }

    toggleSelect() {
        // We can skip changing this.selected, because a checkbox is bound to this.selected

        // The function is called after changing this.selected
        if (this.file.selected) {
            EventBus.$emit(Events.FilesBlock.SelectFile, { id: this.file.id });
        } else {
            EventBus.$emit(Events.FilesBlock.UnselectFile, { id: this.file.id });
        }
    }
}
</script>
