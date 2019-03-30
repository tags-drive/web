<template>
	<div>
		<div
			v-for="(tag, index) in tags"
			:key="index"
			style="margin: 0 auto; width: 40%;"
		>
			<div style="display: flex; margin-bottom: 5px; position: relative;">
				<div style="width: 200px; display: flex">
					<tag :tag="tag" style="margin: 0;"></tag>
				</div>
				<div style="position: absolute; right: 0;">
					<input
						type="checkbox"
						style="width: 20px; height: 20px; right: 0;"
						v-model="tag.selected">
				</div>
			</div>
		</div>

		<div style="margin-top: 15px;">
			<input class="btn" type="button" value="Change tags" @click="updateTags">
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
        file: File
    },
    data: function() {
        return {
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
            if (this.file.tags.includes(id)) {
                t.selected = true;
            }

            this.tags.push(t);
        }
    },
    //
    methods: {
        updateTags: function() {
            let tagsIDs: number[] = [];
            this.tags.filter(tag => tag.selected).forEach(tag => tagsIDs.push(tag.id));

            API.files.changeTags(this.file.id, tagsIDs);
            this.hideWindow();
        },
        hideWindow: function() {
            EventBus.$emit(Events.ModalWindow.HideWindow);
        }
    }
});
</script>
