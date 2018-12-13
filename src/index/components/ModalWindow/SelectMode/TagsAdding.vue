<template>
	<div>
		<div style="font-size: 20px;">Add tags</div>
		<p></p>
		<div style="margin-right: auto; margin-left: auto; width: 40%;">
			<tags-manager
				:tags="SharedStore.state.allTags"
				ref="tags-manager"
			></tags-manager>
			<br>
			<input class="btn" type="button" value="Add tags" @click="filesAPI().tagSelectedFiles()">
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
//
import TagsManager from "./TagsManager.vue";
//
import { File } from "@/index/global";
//
import { Events, EventBus } from "@/index/eventBus";
// Utils
import { Params } from "@/global";
import { logError, isErrorStatusCode } from "@/index/tools";

@Component({
    components: {
        "tags-manager": TagsManager
    }
})
export default class extends Vue {
    selectedFiles: File[] = [];

    tagSelectedFiles() {
        let ref = <Vue>this.$refs["tags-manager"];
        let tagIDs = ref.$data.selectedTags;

        if (tagIDs.length === 0) {
            return;
        }

        // Update tags and refresh list of files after all changes
        (async () => {
            for (let file of this.selectedFiles) {
                let tags = new Set(file.tags);
                for (let tag of tagIDs) {
                    tags.add(tag);
                }

                let params = new URLSearchParams();
                params.append("file", file.filename);
                params.append("tags", Array.from(tags).join(","));

                await fetch(Params.Host + "/api/files/tags?" + params, {
                    method: "PUT"
                })
                    .then(resp => {
                        if (isErrorStatusCode(resp.status)) {
                            resp.text().then(text => {
                                logError(text);
                            });
                            return;
                        }
                    })
                    .catch(err => logError(err));
            }
        })()
            .then(() => {
                // Refresh list of files
                EventBus.$emit(Events.FilesBlock.UnselectAllFiles);
                EventBus.$emit(Events.Search.Usual);
                this.hideWindow();
            })
            .catch(err => logError(err));
    }

    hideWindow() {
        alert("TODO");
    }
}
</script>
