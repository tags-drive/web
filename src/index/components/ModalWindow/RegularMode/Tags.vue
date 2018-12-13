<template>
	<div>
		<!-- Current tags -->
		<div
			class="tags-field"
			title="Tags of a file"
			@drop.prevent="addTag($event)"
			@dragover.prevent
		>
			<tags-input
				v-for="(id, index) in Array.from(newTags.keys())"
				:key="index"
				:id="id"
			></tags-input>
		</div>

		<div style="border-bottom: 1px solid black; width: 90%; margin: 20px auto 20px auto;"></div>

		<!-- All tags -->
		<div
			class="tags-field"
			title="Unused tags"
			@drop.prevent="deleteTag($event)"
			@dragover.prevent
		>
			<tags-input
				v-for="(id, index) in Array.from(unusedTags.keys())"
				:key="index"
				:id="id">
			</tags-input>
		</div>
		<br>

		<input class="btn" type="button" value="Change tags" @click="updateTags()">
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
import TagsInput from "@/index/components/TagsInput.vue";
// Shared data
import SharedStore from "@/index/store";
//
import { File, Tag } from "@/index/global";
import { Events, EventBus } from "@/index/eventBus";
// Utils
import { Params } from "@/global";
import { logError, isErrorStatusCode } from "@/index/tools";

@Component({
    components: {
        "tags-input": TagsInput
    }
})
export default class extends Vue {
    @Prop() file!: File;
    unusedTags: Map<number, Tag> = new Map();
    newTags: Map<number, Tag> = new Map();

    created() {
        this.newTags.clear();
        this.unusedTags.clear();

        for (let [id, tag] of SharedStore.state.allTags) {
            if (this.file.tags.includes(id)) {
                this.newTags.set(id, tag);
            } else {
                this.unusedTags.set(id, tag);
            }
        }
    }

    addTag(ev: DragEvent) {
        if (ev === null || ev.dataTransfer === null) {
            return;
        }

        let tagID = Number(ev.dataTransfer.getData("tagID"));
        if (this.unusedTags.has(tagID)) {
            let t = this.unusedTags.get(tagID);
            this.newTags.set(tagID, t!);
            this.unusedTags.delete(tagID);
        }
    }

    deleteTag(ev: DragEvent) {
        if (ev === null || ev.dataTransfer === null) {
            return;
        }

        let tagID = Number(ev.dataTransfer.getData("tagID"));

        if (this.newTags.has(tagID)) {
            let t = this.newTags.get(tagID);
            this.unusedTags.set(tagID, t!);
            this.newTags.delete(tagID);
        }
    }

    updateTags() {
        let params = new URLSearchParams();
        let tags = Array.from(this.newTags.keys());
        params.append("file", this.file.filename);
        params.append("tags", tags.join(","));

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
        alert("TODO");
    }
}
</script>

