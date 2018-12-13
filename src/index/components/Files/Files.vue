<template>
	<tr
		v-show="!file.deleted || SharedState.state.settings.showDeletedFiles"
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
				v-model="selected"
				@change="toggleSelect">
		</td>
		<td
			v-if="file.type === 'image'"
			title="Show preview"
			style="width: 50px; text-align: center; cursor: pointer;"
			@click="showPreview"
		>
			<img
				style="display: inline-block; height: auto; max-height: 100%; max-width: 100%; width: auto;"	
				:src="previewLink">
		</td>
		<td
			v-else
			style="width: 50px; text-align: center; cursor: pointer;"
			title="Show preview"
			@click="showPreview"
		>
			<img
				style="width: 30px; cursor: pointer;"
				:src="previewLink">
		</td>	
		<td>
			<div class="filename" :title="file.filename">
				{{file.filename}}
			</div>
		</td>
		<td>
			<div style="display: flex; flex-wrap: wrap;">
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
</style>


<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
// Components
import TagComponent from "../Tag/Tag.vue";
// Shared data
import SharedStore from "../../store";
import { Store } from "../../store/types";
//
import { Events, EventBus } from "../../eventBus";
import { File, Tag } from "@/index/global";
import { Params } from "../../../global";

@Component({
    components: {
        tag: TagComponent
    }
})
export default class extends Vue {
    @Prop() file!: File;
    hover: boolean = false;
    selected: boolean = false;
    //
    Store: Store = SharedStore.state;

    get stylesObject() {
        let bgColor = "white";
        if (this.hover || this.selected) {
            bgColor = "rgba(0, 0, 0, 0.1)";
        }
        return {
            opacity: this.file.deleted && !this.selected ? 0.4 : 1,
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

    created() {
        /* For the parent */
        this.$on("select", () => {
            this.selected = true;
        });

        this.$on("unselect", () => {
            this.selected = false;
        });

        this.$on("getFile", () => {
            if (this.selected) {
                this.$parent.$emit("sendFile", { selected: true, file: this.file });
            } else {
                // Can skip file
                this.$parent.$emit("sendFile", { selected: false });
            }
        });
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
        if (this.selected) {
            EventBus.$emit(Events.FilesBlock.SelectFile);
        } else {
            EventBus.$emit(Events.FilesBlock.UnselectFile);
        }
    }
}
</script>
