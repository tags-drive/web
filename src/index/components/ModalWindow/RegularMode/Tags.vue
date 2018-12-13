<template>
	<div>
		<div
			v-for="(tag, index) in tags"
			:key="index"
			style="margin-right: auto; margin-left: auto; width: 40%;"
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

		<input class="btn" type="button" value="Change tags" @click="updateTags">
	</div>
</template>

<style scoped>
.tags-field {
    border: 1px dashed var(--primary-border-color);
    border-radius: 5px;
    display: flex;
    flex-wrap: wrap;
    margin: 0 auto;
    min-height: 40px;
    padding: 10px;
    width: 80%;
}
</style>


<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
// Components
import TagComponent from "@/index/components/Tag/Tag.vue";
// Shared data
import SharedStore from "@/index/store";
//
import { File, Tag } from "@/index/global";
import { Events, EventBus } from "@/index/eventBus";
// Utils
import { Params } from "@/global";
import { logError, isErrorStatusCode } from "@/index/tools";

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
        let ids: number[] = [];
        this.tags.filter(tag => tag.selected).forEach(tag => ids.push(tag.id));

        let params = new URLSearchParams();
        params.append("file", this.file.filename);
        params.append("tags", ids.join(","));

        fetch(Params.Host + "/api/files/tags?" + params, {
            method: "PUT",
            credentials: "same-origin"
        })
            .then(resp => {
                if (isErrorStatusCode(resp.status)) {
                    resp.text().then(text => {
                        logError(text);
                    });
                    return;
                }
                // Refresh list of files
                EventBus.$emit(Events.Search.Usual);
                this.hideWindow();
            })
            .catch(err => {
                logError(err);
            });
    }

    hideWindow() {
        EventBus.$emit(Events.ModalWindow.HideWindow);
    }
}
</script>

