<template>
	<div>
		<!-- Existed tags -->
		<modifying-tags
			v-for="(id, index) in allTagsIDs"
			:key="index"
			:tagID="id"
			:tag="Store.allTags.get(id)"
		></modifying-tags>
		<p></p>

		<span style="font-size: 18px;">New tag creation</span>
		<p></p>

		<!-- New tag -->
		<modifying-tags :is-new-tag="true"></modifying-tags>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// Components
import ModifyingTags from "@components/ModalWindow/ModifyingTags.vue";
// Shared data
import SharedStore from "@app/index/store";
import { Store } from "@app/index/store/types";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import { Params } from "@app/global";
import { logError, logInfo, isErrorStatusCode } from "@app/index/tools";
import API from "@app/index/api";

@Component({
    components: {
        "modifying-tags": ModifyingTags
    }
})
export default class extends Vue {
    Store: Store = SharedStore.state;

    get allTagsIDs() {
        // For reactive updating (see @app/index/store/types.ts for more information)
        return SharedStore.state.allTagsChangesCounter && Array.from(SharedStore.state.allTags.keys());
    }

    created() {
        this.$on("add-tag", (payload: any) => {
            this.addTag(payload.name, payload.color);
        });
        this.$on("change-tag", (payload: any) => {
            this.changeTag(payload.tagID, payload.newName, payload.newColor);
        });
        this.$on("delete-tag", (payload: any) => {
            this.deleteTag(payload.tagID);
        });
    }

    addTag(name: string, color: string) {
        API.tags.add(name, color);
    }

    changeTag(tagID: number, newName: string, newColor: string) {
        API.tags.change(tagID, newName, newColor);
    }

    deleteTag(tagID: number) {
        API.tags.delete(tagID);
    }
}
</script>
