<template>
	<div>
		<div style="font-size: 20px;">
			<span v-if="mode === 'add-mode'">Add tags</span>
			<span v-else-if="mode === 'delete-mode'">Delete tags</span>
		</div>
		<p></p>
		<div style="margin-right: auto; margin-left: auto; width: 40%;">
			<div
				v-for="(tag, index) in tags"
				:key="index"
			>
				<div style="display: flex; margin-right: auto; margin-left: auto; margin-bottom: 5px; position: relative;">
					<div style="width: 200px; display: flex">
						<tag :tag="tag" style="margin: 0;"></tag>
					</div>
					<div style="position: absolute; right: 0;">
						<input
							type="checkbox"
							style="width: 20px; height: 20px; right: 0;"
							v-model="tag.selected"
						>
					</div>
				</div>
			</div>
			<br>
			<input class="btn" type="button" value="Submit" @click="processSelectedFiles">
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
// Components
import TagComponent from "@components/Tag/Tag.vue";
// Classes and types
import { File } from "@app/index/global";
// Shared data
import SharedStore from "@app/index/store";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import { Params } from "@app/global";
import { logError, isErrorStatusCode } from "@app/index/tools";

interface CustomTag {
    id: number;
    name: string;
    color: string;
    selected: boolean;
}

export const AddMode = "add-mode";
export const DeleteMode = "delete-mode";

@Component({
    components: {
        tag: TagComponent
    }
})
export default class extends Vue {
    @Prop() selectedFiles!: File[];
    @Prop() mode!: string;
    tags: CustomTag[] = [];

    created() {
        for (let [id, tag] of SharedStore.state.allTags) {
            let t: CustomTag = { id: id, name: tag.name, color: tag.color, selected: false };
            this.tags.push(t);
        }
    }

    processSelectedFiles() {
        let method = "POST";
        if (this.mode === DeleteMode) {
            method = "DELETE";
        }

        let tagIDs: number[] = [];
        this.tags.filter(tag => tag.selected).forEach(tag => tagIDs.push(tag.id));
        let fileIDs: number[] = [];
        this.selectedFiles.forEach(file => fileIDs.push(file.id));

        if (tagIDs.length === 0 || fileIDs.length === 0) {
            return;
        }

        let params = new URLSearchParams();
        params.append("files", fileIDs.join(","));
        params.append("tags", tagIDs.join(","));

        fetch(Params.Host + `/api/files/tags?` + params, {
            method: method
        })
            .then(resp => {
                if (isErrorStatusCode(resp.status)) {
                    resp.text().then(text => {
                        logError(text);
                    });

                    return;
                }

                EventBus.$emit(Events.FilesBlock.UnselectAllFiles);
                EventBus.$emit(Events.Search.Usual);
                this.hideWindow();
            })
            .catch(err => logError(err));
    }

    hideWindow() {
        EventBus.$emit(Events.ModalWindow.HideWindow);
    }
}
</script>
