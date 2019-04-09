<template>
	<div>
		<div style="font-size: 20px; margin-bottom: 10px;">
			<span v-if="mode === SharedModes.addMode">Add tags</span>
			<span v-else-if="mode === SharedModes.deleteMode">Delete tags</span>
		</div>

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

			<div style="margin-top: 15px;">
				<input class="btn" type="button" value="Submit" @click="processSelectedFiles">
			</div>
		</div>
	</div>
</template>


<style scoped>
.btn {
    height: 25px;
    font-size: 15px;
    width: 100px;
}
</style>


<script lang="ts">
import Vue from "vue";
// Components
import TagComponent from "@components/Tag/Tag.vue";
// Classes and types
import { File, Tag } from "@app/global/classes";
// Shared data
import SharedStore from "@app/index/store";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import { Params } from "@app/global";
import { Const } from "@app/global/const";
import { logError } from "@app/index/utils";
import { isErrorStatusCode } from "@app/global/utils";
import API from "@app/index/api";

class CustomTag extends Tag {
    id: number;
    selected: boolean;

    constructor(id: number, t: Tag) {
        super();

        this.id = id;
        this.name = t.name;
        this.color = t.color;
        this.selected = false;
    }
}

export default Vue.extend({
    props: {
        selectedFiles: Array as () => Array<File>,
        mode: String
    },
    data: function() {
        return {
            SharedModes: Const.tagsChanging,
            tags: <CustomTag[]>[]
        };
    },
    //
    components: {
        tag: TagComponent
    },
    //
    created: function() {
        for (let [id, tag] of SharedStore.state.allTags) {
            let t = new CustomTag(id, tag);
            this.tags.push(t);
        }
    },
    methods: {
        processSelectedFiles: function() {
            let tagIDs: number[] = [];
            this.tags.filter(tag => tag.selected).forEach(tag => tagIDs.push(tag.id));
            let fileIDs: number[] = [];
            this.selectedFiles.forEach(file => fileIDs.push(file.id));

            if (tagIDs.length === 0 || fileIDs.length === 0) {
                return;
            }

            API.files.changeFilesTags(fileIDs, tagIDs, this.mode);
            this.hideWindow();
        },
        hideWindow: function() {
            EventBus.$emit(Events.ModalWindow.HideWindow);
        }
    }
});
</script>
