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
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
// Components
import TagComponent from "@components/Tag/Tag.vue";
// Classes and types
import { File, Tag } from "@app/index/global";
// Shared data
import SharedStore from "@app/index/store";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import API from "@app/index/api";

interface CustomTag {
    id: number;
    name: string;
    color: string;
    selected: boolean;
}

@Component({
    components: {
        tag: TagComponent
    }
})
export default class extends Vue {
    @Prop() file!: File;
    tags: CustomTag[] = [];

    created() {
        for (let [id, tag] of SharedStore.state.allTags) {
            let t: CustomTag = { id: id, name: tag.name, color: tag.color, selected: false };
            if (this.file.tags.includes(id)) {
                t.selected = true;
            }

            this.tags.push(t);
        }
    }

    updateTags() {
        let tagsIDs: number[] = [];
        this.tags.filter(tag => tag.selected).forEach(tag => tagsIDs.push(tag.id));

        API.files.changeTags(this.file.id, tagsIDs);
        this.hideWindow();
    }

    hideWindow() {
        EventBus.$emit(Events.ModalWindow.HideWindow);
    }
}
</script>

